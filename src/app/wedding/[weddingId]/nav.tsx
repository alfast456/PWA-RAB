"use client";

import Link from "next/link";

export default function WeddingNav({
  weddingId,
  weddingName,
}: {
  weddingId: string;
  weddingName: string;
}) {
  const links = [
    { href: `/wedding/${weddingId}`, label: "Dashboard" },
    { href: `/wedding/${weddingId}/rab`, label: "RAB" },
    { href: `/wedding/${weddingId}/vendors`, label: "Vendor" },
    { href: `/wedding/${weddingId}/checklist`, label: "Checklist" },
    { href: `/wedding/${weddingId}/members`, label: "Members" },
  ];

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-2">
          <Link href="/wedding" className="text-sm text-gray-600 hover:underline">
            &larr; Semua Wedding
          </Link>
          <h1 className="font-semibold truncate">{weddingName}</h1>
        </div>
        <nav className="flex gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
