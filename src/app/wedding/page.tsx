"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Wedding {
  id: string;
  name: string;
  weddingDate?: string | null;
}

export default function WeddingListPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wedding", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWeddings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wedding Saya</h1>
        <Link
          href="/wedding/new"
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Buat Wedding Baru
        </Link>
      </div>

      {weddings.length === 0 ? (
        <p className="text-gray-600">Belum ada wedding. Buat wedding pertama Anda!</p>
      ) : (
        <div className="grid gap-4">
          {weddings.map((wedding) => (
            <Link
              key={wedding.id}
              href={`/wedding/${wedding.id}`}
              className="block rounded-lg border p-4 hover:border-gray-400"
            >
              <div className="font-semibold">{wedding.name}</div>
              {wedding.weddingDate && (
                <div className="text-sm text-gray-600">
                  {new Date(wedding.weddingDate).toLocaleDateString("id-ID")}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
