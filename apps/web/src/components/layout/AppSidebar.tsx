"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth.store";
import {
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarUserSection } from "./SidebarUserSection";
import Image from "next/image";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  creatorOnly?: boolean;
  showWhen?: (user: { stripeConnected: boolean }) => boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/app/dashboard",
    icon: LayoutDashboard,
    creatorOnly: true,
  },
  {
    title: "Meus Packs",
    href: "/app/dashboard/packs",
    icon: Package,
    creatorOnly: true,
  },
  {
    title: "Saldo e Saques",
    href: "/app/dashboard/balance",
    icon: Wallet,
    creatorOnly: true,
  },
  {
    title: "Conectar Stripe",
    href: "/app/dashboard/stripe-connect",
    icon: CreditCard,
    creatorOnly: true,
    showWhen: (user) => !user.stripeConnected,
  },
  {
    title: "Minhas Compras",
    href: "/app/me/purchases",
    icon: ShoppingBag,
  },
];

export function AppSidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const isCreator = user?.userType === "creator";

  const filteredNavItems = navItems.filter((item) => {
    if (item.creatorOnly && !isCreator) return false;
    if (item.showWhen && user && !item.showWhen(user)) return false;
    return true;
  });

  const homeHref = isCreator ? "/app/dashboard" : "/app/me/purchases";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeHref}>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <Image
                    src="/img/logo.svg"
                    alt="Pack do Pezin"
                    width={140}
                    height={32}
                    className="h-10 w-auto"
                  />

                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold">{isCreator ? "Área do Criador" : "Área do Cliente"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/app/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ir para o Site">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                <span>Ir para o Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarUserSection />
      </SidebarFooter>
    </Sidebar>
  );
}
