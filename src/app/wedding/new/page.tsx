"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NewWeddingPage() {
  const [name, setName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      router.push(`/wedding/${data.id}`);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <Card className="max-w-sm w-full">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-display text-center">Buat Wedding Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-destructive text-sm text-center">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Wedding</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Pernikahan Budi & Siti"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weddingDate">Tanggal Pernikahan</Label>
              <Input
                id="weddingDate"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Buat Wedding"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
