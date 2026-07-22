"use client";

import { useState } from "react";
import { redirect } from "next/navigation";

export default function NewWeddingPage() {
  const [name, setName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/wedding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, weddingDate }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error?.message || "Gagal membuat wedding");
      setLoading(false);
    } else {
      redirect(`/wedding/${data.id}`);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Buat Wedding Baru</h1>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nama Wedding</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Misal: Pernikahan Budi & Siti"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tanggal Pernikahan</label>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Buat Wedding"}
        </button>
      </form>
    </main>
  );
}
