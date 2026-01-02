import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  title,
  subtitle,
  className,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[40px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-[#A1A1A1] md:text-lg">{subtitle}</p>
      )}
    </div>
  );
}