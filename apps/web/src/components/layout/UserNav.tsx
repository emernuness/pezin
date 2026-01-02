"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/app/login");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";

    const trimmedName = name.trim();
    if (!trimmedName) return "U";

    const initials = trimmedName
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    return initials || "U";
  };

  const isCreator = user?.userType === "creator";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.profileImage || undefined}
              alt={user?.displayName || "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user?.displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.displayName || "Usuario"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {isCreator && (
              <p className="text-xs leading-none text-primary mt-1">
                Criador de conteudo
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Creator-specific menu items */}
        {isCreator && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/app/dashboard" className="w-full cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/dashboard/packs" className="w-full cursor-pointer">
                  <Package className="mr-2 h-4 w-4" />
                  <span>Meus Packs</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/dashboard/balance" className="w-full cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Saldo e Saques</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Common menu items */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/app/purchases" className="w-full cursor-pointer">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Minhas Compras</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/app/profile" className="w-full cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/app/settings" className="w-full cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuracoes</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Stripe Connect status for creators */}
        {isCreator && !user?.stripeConnected && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/app/dashboard/stripe-connect"
                className="w-full cursor-pointer text-amber-600"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Conectar Stripe</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
