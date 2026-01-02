"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { AuthGuard } from "../auth/AuthGuard";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import Link from "next/link";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ["/app/login", "/app/signup"];

function ProfileCompletionAlert() {
  const { user } = useAuthStore();

  const isCreator = user?.userType === "creator";
  const hasCompleteProfile = user?.fullName && user?.cpf && user?.phone && user?.address?.zipCode;

  if (!isCreator || hasCompleteProfile) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-4 mx-6 mt-6 rounded-xl bg-primary">
      <UserCircle className="h-5 w-5 text-black shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-black">
          Complete seu perfil para receber pagamentos
        </p>
        <p className="text-xs text-black/70">
          Preencha seus dados pessoais (CPF, telefone, endereço) para poder sacar seus ganhos.
        </p>
      </div>
      <Button
        asChild
        size="sm"
        className="bg-black text-white hover:bg-black/80 shrink-0"
      >
        <Link href="/app/profile">Completar Perfil</Link>
      </Button>
    </div>
  );
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();

  const isAuthPage = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isAuthPage) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background">
        {children}
      </div>
    );
  }

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <ProfileCompletionAlert />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
