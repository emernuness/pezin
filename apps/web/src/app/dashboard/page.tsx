'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Bem-vindo!</h2>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Tipo:</strong> {user.userType}
            </p>
            <p>
              <strong>Email verificado:</strong>{' '}
              {user.emailVerified ? 'Sim' : 'Não'}
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            🚧 Dashboard em desenvolvimento. Funcionalidades de packs serão
            adicionadas nos próximos PRs.
          </p>
        </div>
      </div>
    </div>
  );
}
