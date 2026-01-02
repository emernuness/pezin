import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Container } from "./Container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  variant?: "default" | "dark" | "accent";
}

export function Section({
  children,
  className,
  containerClassName,
  id,
  variant = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 md:py-28",
        variant === "default" && "bg-[#0A0A0A]",
        variant === "dark" && "bg-[#141414]",
        variant === "accent" && "bg-gradient-to-br from-[#141414] to-[#0A0A0A]",
        className
      )}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
