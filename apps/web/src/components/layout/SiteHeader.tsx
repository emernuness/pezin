"use client";

import { UserNav } from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMe();
  }, [fetchMe]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block">Pack do Pezin</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!mounted ? (
              // Loading/SSR state - mostra nada ou skeleton para evitar layout shift drástico
              // ou mostra botão "Entrar" por padrão
              <div className="h-8 w-8" />
            ) : isAuthenticated ? (
              <UserNav />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Criar conta</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
