import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

/**
 * Gate component that blocks non-creators from accessing the dashboard.
 * Provides links to alternative pages for consumers.
 */
export function CreatorOnlyGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md text-center border-border shadow-card">
        <CardHeader className="pb-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-foreground">
            Area exclusiva para criadores
          </h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Esta pagina e apenas para criadores de conteudo.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/app/me/purchases">Ver minhas compras</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/explore">Explorar vitrine</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
