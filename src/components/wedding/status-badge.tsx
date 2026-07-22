import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusVariant = "aman" | "over" | "lunas" | "jatuh-tempo" | "overdue" | "belum" | "sedang";

const variantStyles: Record<StatusVariant, string> = {
  aman: "bg-secondary/15 text-secondary border-secondary/30",
  over: "bg-destructive/15 text-destructive border-destructive/30",
  lunas: "bg-secondary/15 text-secondary border-secondary/30",
  "jatuh-tempo": "bg-accent/15 text-accent border-accent/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
  belum: "bg-muted text-muted-foreground border-border",
  sedang: "bg-accent/15 text-accent border-accent/30",
};

const variantLabels: Record<StatusVariant, string> = {
  aman: "Aman",
  over: "Over Budget",
  lunas: "Lunas",
  "jatuh-tempo": "Jatuh Tempo",
  overdue: "Overdue",
  belum: "Belum",
  sedang: "Sedang",
};

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(variantStyles[variant], "text-xs font-normal", className)}
    >
      {label || variantLabels[variant]}
    </Badge>
  );
}