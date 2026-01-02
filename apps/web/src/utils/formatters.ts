/**
 * Utility functions for formatting values across the application.
 * Centralizes all formatting logic to avoid duplication.
 */

/**
 * Formats a value in cents to Brazilian Real currency format.
 * @param cents - Value in cents (e.g., 2990 for R$ 29,90)
 * @returns Formatted currency string (e.g., "R$ 29,90")
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Formats a date string or Date object to Brazilian format.
 * @param date - Date string or Date object
 * @param options - Optional Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Intl.DateTimeFormat("pt-BR", options ?? defaultOptions).format(
    typeof date === "string" ? new Date(date) : date
  );
}

/**
 * Formats a short date (day and month only).
 * @param date - Date string or Date object
 * @returns Formatted short date (e.g., "15 jan")
 */
export function formatShortDate(date: string | Date): string {
  return formatDate(date, { day: "numeric", month: "short" });
}

/**
 * Formats a CPF number with mask (XXX.XXX.XXX-XX).
 * @param value - Raw CPF string (digits only or partially formatted)
 * @returns Formatted CPF string
 */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

/**
 * Formats a Brazilian phone number with mask.
 * Supports both landline (XX) XXXX-XXXX and mobile (XX) XXXXX-XXXX.
 * @param value - Raw phone string (digits only or partially formatted)
 * @returns Formatted phone string
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

/**
 * Formats a Brazilian CEP (postal code) with mask (XXXXX-XXX).
 * @param value - Raw CEP string (digits only or partially formatted)
 * @returns Formatted CEP string
 */
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");
}

/**
 * Removes all formatting from a string, keeping only digits.
 * Useful for sending clean values to the API.
 * @param value - Formatted string
 * @returns String with digits only
 */
export function stripFormatting(value: string): string {
  return value.replace(/\D/g, "");
}
