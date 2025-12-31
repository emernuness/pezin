import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Pack do Pezin
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Plataforma de monetização para criadores de conteúdo
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="secondary">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Criar conta</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
