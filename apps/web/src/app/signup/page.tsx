'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    birthDate: '',
    userType: 'consumer' as 'creator' | 'consumer',
    acceptTerms: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/signup', formData);
      router.push('/login');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-muted-foreground mt-2">
            Comece a monetizar seu conteúdo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              placeholder="Mín. 8 caracteres"
            />
            <p className="text-xs text-muted-foreground">
              Deve conter letras maiúsculas, minúsculas e números
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">Tipo de conta</Label>
            <select
              id="userType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.userType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userType: e.target.value as 'creator' | 'consumer',
                })
              }
            >
              <option value="consumer">Consumidor</option>
              <option value="creator">Criador</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={formData.acceptTerms}
              onChange={(e) =>
                setFormData({ ...formData, acceptTerms: e.target.checked })
              }
              required
            />
            <Label htmlFor="acceptTerms" className="font-normal">
              Aceito os termos de uso e tenho 18+ anos
            </Label>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <div className="text-center text-sm">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
