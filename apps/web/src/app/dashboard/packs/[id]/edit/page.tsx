'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash, Upload, X } from 'lucide-react';

interface EditPackPageProps {
  params: {
    id: string;
  };
}

export default function EditPackPage({ params }: EditPackPageProps) {
  const router = useRouter();
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchPack() {
      try {
        const { data } = await api.get(`/packs/${params.id}`);
        setPack(data);
      } catch (error) {
        console.error(error);
        alert('Erro ao carregar pack');
        router.push('/dashboard/packs');
      } finally {
        setLoading(false);
      }
    }
    fetchPack();
  }, [params.id, router]);

  const handlePublish = async () => {
    try {
      await api.post(`/packs/${params.id}/publish`);
      alert('Pack publicado com sucesso!');
      router.push('/dashboard/packs');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao publicar pack. Verifique se possui 3 arquivos e 1 preview.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'preview' | 'file') => {
    if (!e.target.files?.length) return;
    setUploading(true);

    try {
      const file = e.target.files[0];

      // 1. Get Upload URL
      const { data: uploadData } = await api.post(`/packs/${params.id}/upload-url`, {
        filename: file.name,
        contentType: file.type,
        type,
      });

      // 2. Upload to R2 (using axios or fetch PUT)
      await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // 3. Confirm
      await api.post(`/packs/${params.id}/files`, {
        fileId: uploadData.fileId,
        key: uploadData.key,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        type,
      });

      // Reload
      const { data } = await api.get(`/packs/${params.id}`);
      setPack(data);

    } catch (error) {
      console.error(error);
      alert('Erro no upload');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Editar Pack</h1>
           <p className="text-gray-500">{pack.title}</p>
        </div>
        <div className="flex gap-4">
           {pack.status === 'draft' ? (
              <Button onClick={handlePublish} className="bg-lime-500 hover:bg-lime-600">Publicar Pack</Button>
           ) : (
              <Badge>Publicado</Badge>
           )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
         {/* Previews Section */}
         <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">Previews (Capa)</h3>
            <p className="text-xs text-gray-500">Imagens públicas. Sem nudez explícita. Máx 3.</p>

            <div className="grid grid-cols-3 gap-2">
               {pack.previews.map((preview: any) => (
                  <div key={preview.id} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                     <img src={preview.url} alt="Preview" className="h-full w-full object-cover" />
                     {/* Delete button stub */}
                  </div>
               ))}
               {pack.previews.length < 3 && (
                  <Label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50">
                     <Upload className="h-6 w-6 text-gray-400" />
                     <span className="mt-2 text-xs text-gray-500">{uploading ? '...' : 'Add'}</span>
                     <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'preview')}
                        disabled={uploading}
                     />
                  </Label>
               )}
            </div>
         </div>

         {/* Files Section */}
         <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">Arquivos do Pack</h3>
            <p className="text-xs text-gray-500">Conteúdo exclusivo (Fotos/Vídeos). Mín 3 arquivos.</p>

            <div className="space-y-2">
               {pack.files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                     <span className="truncate text-sm font-medium text-gray-700">{file.filename}</span>
                     <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
               ))}
            </div>

            <Label className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-6 hover:bg-gray-50">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-600">{uploading ? 'Enviando...' : 'Adicionar Arquivos'}</span>
                </div>
                <Input
                   type="file"
                   accept="image/*,video/*"
                   className="hidden"
                   onChange={(e) => handleFileUpload(e, 'file')}
                   disabled={uploading}
                />
            </Label>
         </div>
      </div>
    </div>
  );
}
