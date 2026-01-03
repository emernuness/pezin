"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Stripe Connect page is deprecated.
 * Redirects to profile page where users can configure PIX key.
 */
export default function StripeConnectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/profile");
  }, [router]);

  return (
    <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
      <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  );
}
