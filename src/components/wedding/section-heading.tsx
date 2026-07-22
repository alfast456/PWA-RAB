import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  value?: string;
  className?: string;
}

export function SectionHeading({ title, value, className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "border-b border-accent/60 pb-2 mb-3 flex items-baseline justify-between font-display",
        className
      )}
    >
      <h3 className="text-xl">{title}</h3>
      {value && <span className="text-xl tabular-nums">{value}</span>}
    </div>
  );
}