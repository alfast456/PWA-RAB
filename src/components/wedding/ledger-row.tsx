import { cn } from "@/lib/utils";

interface LedgerRowProps {
  label: string;
  value: string;
  sublabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function LedgerRow({ label, value, sublabel, className, children }: LedgerRowProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between border-b border-border py-2 gap-4",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate">{label}</span>
        {sublabel && (
          <span className="block text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm tabular-nums">{value}</span>
        {children}
      </div>
    </div>
  );
}