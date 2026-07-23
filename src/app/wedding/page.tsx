"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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

  if (loading) return <div className="p-6 text-muted-foreground">Memuat...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display">Wedding Saya</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => signOut({ callbackUrl: window.location.origin + '/login' })}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
          <Button asChild>
            <Link href="/wedding/new">Buat Wedding Baru</Link>
          </Button>
        </div>
      </div>

      {weddings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Belum ada wedding. Buat wedding pertama Anda!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {weddings.map((wedding) => (
            <Link key={wedding.id} href={`/wedding/${wedding.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="font-display text-lg">{wedding.name}</CardTitle>
                  {wedding.weddingDate && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(wedding.weddingDate).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
