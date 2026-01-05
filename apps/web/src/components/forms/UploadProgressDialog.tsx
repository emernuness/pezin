"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, Loader2, Upload, Save, AlertCircle } from "lucide-react";

export type UploadPhase = "idle" | "uploading" | "saving" | "done" | "error";

interface UploadProgressDialogProps {
  open: boolean;
  phase: UploadPhase;
  totalFiles: number;
  uploadedFiles: number;
  currentFileName?: string;
  errorMessage?: string;
}

/**
 * Dialog que mostra o progresso do upload e salvamento.
 * Usado para dar feedback visual ao usuario durante operacoes longas.
 */
export function UploadProgressDialog({
  open,
  phase,
  totalFiles,
  uploadedFiles,
  currentFileName,
  errorMessage,
}: UploadProgressDialogProps) {
  const progress = totalFiles > 0 ? Math.round((uploadedFiles / totalFiles) * 100) : 0;

  const getPhaseContent = () => {
    switch (phase) {
      case "uploading":
        return {
          icon: <Upload className="h-8 w-8 text-primary animate-pulse" />,
          title: "Enviando arquivos...",
          subtitle: `${uploadedFiles} de ${totalFiles} arquivo(s)`,
          showProgress: true,
        };
      case "saving":
        return {
          icon: <Save className="h-8 w-8 text-primary animate-pulse" />,
          title: "Salvando alteracoes...",
          subtitle: "Aguarde enquanto salvamos seu pack",
          showProgress: false,
        };
      case "done":
        return {
          icon: <Check className="h-8 w-8 text-green-500" />,
          title: "Concluido!",
          subtitle: "Todas as alteracoes foram salvas",
          showProgress: false,
        };
      case "error":
        return {
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: "Erro",
          subtitle: errorMessage || "Ocorreu um erro ao salvar",
          showProgress: false,
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />,
          title: "Preparando...",
          subtitle: "",
          showProgress: false,
        };
    }
  };

  const content = getPhaseContent();

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Progresso do envio</DialogTitle>
        <div className="flex flex-col items-center py-6 space-y-4">
          {/* Icon */}
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              phase === "done" && "bg-green-500/10",
              phase === "error" && "bg-destructive/10",
              (phase === "uploading" || phase === "saving") && "bg-primary/10"
            )}
          >
            {content.icon}
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {content.title}
            </h3>
            <p className="text-sm text-muted-foreground">{content.subtitle}</p>
          </div>

          {/* Progress bar */}
          {content.showProgress && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              {currentFileName && (
                <p className="text-xs text-muted-foreground text-center truncate px-4">
                  {currentFileName}
                </p>
              )}
            </div>
          )}

          {/* Spinner for saving phase */}
          {phase === "saving" && (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
