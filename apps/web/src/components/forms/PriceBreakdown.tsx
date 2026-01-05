"use client";

import { Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/utils/formatters";
import {
  GATEWAY_FEE_PERCENTAGE,
  PLATFORM_FEE_PERCENTAGE,
  FEE_DESCRIPTIONS,
  MIN_PACK_PRICE_CENTS,
} from "@/utils/constants";
import { cn } from "@/lib/utils";

interface PriceBreakdownProps {
  priceInCents: number;
  className?: string;
}

/**
 * Componente que mostra o breakdown transparente das taxas
 * quando o criador define o preco do pack.
 *
 * Exibe:
 * - Preco de venda (o que o comprador paga)
 * - Taxa do gateway (SuitPay 5.99%)
 * - Taxa da plataforma (8%)
 * - Valor liquido que o criador recebe
 */
export function PriceBreakdown({ priceInCents, className }: PriceBreakdownProps) {
  // Calcular taxas
  const gatewayFee = Math.round(priceInCents * (GATEWAY_FEE_PERCENTAGE / 100));
  const platformFee = Math.round(priceInCents * (PLATFORM_FEE_PERCENTAGE / 100));
  const totalFees = gatewayFee + platformFee;
  const creatorEarnings = priceInCents - totalFees;
  const creatorPercentage = ((creatorEarnings / priceInCents) * 100).toFixed(1);

  // Nao mostrar se preco invalido ou abaixo do minimo
  if (
    !priceInCents ||
    priceInCents < MIN_PACK_PRICE_CENTS ||
    Number.isNaN(priceInCents)
  ) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-4 shadow-sm",
          className
        )}
      >
        {/* Header - Preco de Venda */}
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
          <span className="text-sm font-medium text-foreground">
            Preco de Venda
          </span>
          <span className="font-mono text-lg font-bold text-foreground">
            {formatCurrency(priceInCents)}
          </span>
        </div>

        {/* Taxas */}
        <div className="space-y-2.5">
          {/* Taxa do Gateway */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Taxa do Gateway</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex cursor-help"
                    aria-label="Informacoes sobre taxa do gateway"
                  >
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="max-w-[220px] bg-foreground text-background"
                >
                  <p className="text-xs leading-relaxed">
                    {FEE_DESCRIPTIONS.gateway}
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="text-muted-foreground/60 text-xs">
                ({GATEWAY_FEE_PERCENTAGE}%)
              </span>
            </div>
            <span className="font-mono text-muted-foreground">
              -{formatCurrency(gatewayFee)}
            </span>
          </div>

          {/* Taxa da Plataforma */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Taxa da Plataforma</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex cursor-help"
                    aria-label="Informacoes sobre taxa da plataforma"
                  >
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="max-w-[220px] bg-foreground text-background"
                >
                  <p className="text-xs leading-relaxed">
                    {FEE_DESCRIPTIONS.platform}
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="text-muted-foreground/60 text-xs">
                ({PLATFORM_FEE_PERCENTAGE}%)
              </span>
            </div>
            <span className="font-mono text-muted-foreground">
              -{formatCurrency(platformFee)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-3" />

        {/* Valor que o Criador Recebe - Destacado */}
        <div className="rounded-lg bg-black p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-white">
                Voce Recebe
              </span>
            </div>
            <span className="font-mono text-xl font-bold text-primary">
              {formatCurrency(creatorEarnings)}
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
