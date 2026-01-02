"use client";

import { UserNav } from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/img/logo.svg"
              alt="Pack do Pezin"
              width={140}
              height={32}
              priority
              className="h-12 w-auto"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!mounted ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : isAuthenticated ? (
              <UserNav />
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/app/signup">Criar conta</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}