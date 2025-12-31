'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Download, FileIcon, ImageIcon, VideoIcon } from 'lucide-react';

interface PackViewerProps {
  params: {
    id: string;
  };
}

export default function PackViewerPage({ params }: PackViewerProps) {
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPack() {
      try {
        const { data } = await api.get(`/me/purchases/${params.id}`);
        setPurchase(data);
      } catch (error) {
        console.error('Error fetching pack', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPack();
  }, [params.id]);

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      setDownloading(fileId);
      const { data } = await api.post(
        `/packs/${params.id}/files/${fileId}/download-url`
      );

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = data.url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter;
        const hoursLeft = retryAfter ? Math.ceil(retryAfter / 3600) : 24;
        alert(
          `Você atingiu o limite de 10 downloads por dia para este arquivo. ` +
          `Tente novamente em ${hoursLeft} hora${hoursLeft > 1 ? 's' : ''}.`
        );
      } else {
        alert('Erro ao gerar download. Tente novamente.');
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadZip = () => {
    alert('Funcionalidade de download ZIP em breve!');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  if (!purchase) return <div className="flex h-screen items-center justify-center">Pack não encontrado</div>;

  const { pack } = purchase;

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-8">
        <Link href="/me/purchases" className="text-sm text-gray-500 hover:text-gray-900">
          ← Voltar para Meus Packs
        </Link>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pack.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={pack.creator.profileImage} />
                <AvatarFallback>{pack.creator.displayName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-gray-600">@{pack.creator.displayName}</span>
            </div>
          </div>
          <Button onClick={handleDownloadZip} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Baixar Tudo (ZIP)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {pack.files.map((file: any) => (
          <div key={file.id} className="group relative overflow-hidden rounded-lg border bg-gray-50">
            <div className="aspect-square flex items-center justify-center bg-gray-100 text-gray-400">
               {file.mimeType.startsWith('image') ? (
                   <ImageIcon className="h-12 w-12" />
               ) : (
                   <VideoIcon className="h-12 w-12" />
               )}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
               <span className="mb-2 px-2 text-center text-xs text-white truncate w-full">{file.filename}</span>
               <Button
                 size="sm"
                 variant="secondary"
                 onClick={() => handleDownload(file.id, file.filename)}
                 disabled={downloading === file.id}
               >
                 {downloading === file.id ? '...' : <Download className="h-4 w-4" />}
               </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
