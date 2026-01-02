import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/utils/formatters";

interface AccountInfoCardProps {
  userType: "creator" | "consumer";
  emailVerified: boolean;
  stripeConnected?: boolean;
  hasCompleteData: boolean;
  birthDate?: string | Date | null;
  createdAt?: string | Date | null;
}

/**
 * Card displaying account status information.
 * Shows account type, verification status, and dates.
 */
export function AccountInfoCard({
  userType,
  emailVerified,
  stripeConnected,
  hasCompleteData,
  birthDate,
  createdAt,
}: AccountInfoCardProps) {
  const isCreator = userType === "creator";

  function formatLongDate(date: string | Date | null | undefined) {
    if (!date) return "-";
    return formatDate(date, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader>
        <CardTitle>Informações da Conta</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted-foreground">Tipo de conta</span>
          <span className="font-medium capitalize">
            {isCreator ? "Criador" : "Consumidor"}
          </span>
        </div>

        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted-foreground">Email verificado</span>
          <span className="font-medium flex items-center gap-2">
            {emailVerified ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Sim
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                Não
              </>
            )}
          </span>
        </div>

        {isCreator && (
          <>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Stripe conectado</span>
              <span className="font-medium flex items-center gap-2">
                {stripeConnected ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Sim
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Não
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Dados completos</span>
              <span className="font-medium flex items-center gap-2">
                {hasCompleteData ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Sim
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Pendente
                  </>
                )}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted-foreground">Data de nascimento</span>
          <span className="font-medium">{formatLongDate(birthDate)}</span>
        </div>

        <div className="flex justify-between py-2">
          <span className="text-muted-foreground">Membro desde</span>
          <span className="font-medium">{formatLongDate(createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
