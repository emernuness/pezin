declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, data?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, data);
  }
}

export function trackCTAClick(ctaText: string, ctaLocation: string, page: string): void {
  trackEvent("cta_click", { cta_text: ctaText, cta_location: ctaLocation, page });
}

export function trackScrollDepth(depth: number, page: string): void {
  trackEvent("scroll_depth", { depth, page });
}

export function trackFAQExpand(questionId: string, questionText: string): void {
  trackEvent("faq_expand", { question_id: questionId, question_text: questionText });
}

export function trackContactSubmit(subject: string): void {
  trackEvent("contact_submit", { subject });
}

export function trackContactError(errorType: string): void {
  trackEvent("contact_error", { error_type: errorType });
}
