/**
 * Application-wide constants.
 * Centralizes magic values and configuration to avoid duplication.
 */

// Image placeholders
export const PLACEHOLDER_IMAGE = "/placeholder-pack.jpg";
export const PLACEHOLDER_IMAGE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Cpath fill='%239ca3af' d='M35 40h30v20H35z'/%3E%3Ccircle fill='%239ca3af' cx='40' cy='35' r='5'/%3E%3C/svg%3E";
export const PLACEHOLDER_AVATAR = "/placeholder-avatar.png";

// File upload constraints
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

// Pack constraints
export const MIN_PACK_FILES = 3;
export const MAX_PREVIEW_IMAGES = 3;
export const MIN_PACK_TITLE_LENGTH = 3;
export const MAX_PACK_TITLE_LENGTH = 100;
export const MIN_PACK_PRICE_CENTS = 990; // R$ 9,90
export const MAX_PACK_PRICE_CENTS = 50000; // R$ 500,00

// Financial - Fee Structure
export const GATEWAY_FEE_PERCENTAGE = 5.99; // SuitPay PIX gateway fee
export const PLATFORM_FEE_PERCENTAGE = 8; // Pack do Pezin platform fee
export const TOTAL_FEE_PERCENTAGE =
  GATEWAY_FEE_PERCENTAGE + PLATFORM_FEE_PERCENTAGE; // ~13.99%
export const CREATOR_EARNINGS_PERCENTAGE = 100 - TOTAL_FEE_PERCENTAGE; // ~86.01%
export const MIN_WITHDRAWAL_CENTS = 5000; // R$ 50,00
export const HOLDING_PERIOD_DAYS = 14;

// Fee descriptions for tooltips
export const FEE_DESCRIPTIONS = {
  gateway:
    "Taxa cobrada pelo processador de pagamentos PIX (SuitPay) para processar transacoes de forma segura.",
  platform:
    "Taxa da plataforma Pack do Pezin para manutencao, suporte e melhorias continuas.",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_DASHBOARD_ITEMS = 5;

// API rate limits (for display purposes)
export const MAX_DOWNLOADS_PER_DAY = 10;

// Pack statuses for display
export const PACK_STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  unpublished: "Despublicado",
  deleted: "Excluído",
};

export const PACK_STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  published: "bg-green-500/10 text-green-600 border-green-500/20",
  unpublished: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  deleted: "bg-red-500/10 text-red-600 border-red-500/20",
};

// Withdrawal statuses for display
export const WITHDRAWAL_STATUS_LABELS: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "Pendente", className: "bg-yellow-500/10 text-black/60" },
  processing: {
    label: "Processando",
    className: "bg-blue-500/10 text-blue-600",
  },
  completed: { label: "Concluído", className: "bg-green-500/10 text-green-600" },
  failed: { label: "Falhou", className: "bg-red-500/10 text-red-600" },
};
