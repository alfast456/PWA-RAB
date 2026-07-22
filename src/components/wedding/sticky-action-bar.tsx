import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 bg-background pt-4 pb-6 px-1 border-t border-border/50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] mt-6",
        className
      )}
    >
      {children}
    </div>
  );
}