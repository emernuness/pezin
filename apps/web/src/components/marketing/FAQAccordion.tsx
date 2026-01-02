"use client";

import { cn } from "@/lib/utils";
import { trackFAQExpand } from "@/lib/analytics";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

interface FAQAccordionProps {
  categories: FAQCategory[];
}

export function FAQAccordion({ categories }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string, question: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        trackFAQExpand(id, question);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.title}>
          <h3 className="mb-4 text-lg font-semibold text-[#D4FF00]">
            {category.title}
          </h3>
          <div className="space-y-3">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#141414]"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id, item.question)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#1A1A1A]"
                  aria-expanded={openItems.has(item.id)}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span className="pr-4 font-medium text-white">
                    {item.question}
                  </span>
                  <svg
                    className={cn(
                      "h-5 w-5 shrink-0 text-[#A1A1A1] transition-transform duration-200",
                      openItems.has(item.id) && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  id={`faq-answer-${item.id}`}
                  className={cn(
                    "grid transition-all duration-200",
                    openItems.has(item.id)
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-[#2A2A2A] p-4 text-[#A1A1A1]">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}