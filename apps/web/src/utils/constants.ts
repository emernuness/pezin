/**
 * Application-wide constants.
 * Centralizes magic values and configuration to avoid duplication.
 */

// Image placeholders
export const PLACEHOLDER_IMAGE = "/placeholder-pack.jpg";
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

// Financial
export const PLATFORM_FEE_PERCENTAGE = 20;
export const CREATOR_EARNINGS_PERCENTAGE = 80;
export const MIN_WITHDRAWAL_CENTS = 5000; // R$ 50,00
export const HOLDING_PERIOD_DAYS = 14;

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
