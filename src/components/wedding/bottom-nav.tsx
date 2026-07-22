"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Store, CheckSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  weddingId: string;
}

export function BottomNav({ weddingId }: BottomNavProps) {
  const pathname = usePathname();

  const links = [
    { href: `/wedding/${weddingId}`, label: "Ringkasan", icon: Home, exact: true },
    { href: `/wedding/${weddingId}/rab`, label: "RAB", icon: Wallet },
    { href: `/wedding/${weddingId}/vendors`, label: "Vendor", icon: Store },
    { href: `/wedding/${weddingId}/checklist`, label: "Checklist", icon: CheckSquare },
    { href: `/wedding/${weddingId}/members`, label: "Member", icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}