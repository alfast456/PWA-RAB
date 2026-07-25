"use client";

import { useState, use } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Member {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  role: string;
}

export default function MembersPage({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = use(params);
  const { data: membersData, isLoading: loading, mutate } = useSWR(`/api/wedding/${weddingId}/members`, fetcher);
  const members = Array.isArray(membersData) ? membersData : [];

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/wedding/${weddingId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error?.message || "Gagal mengundang");
    } else {
      setSuccess("Partner berhasil diundang");
      setEmail("");
      mutate([...members, data], false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <h2 className="text-xl font-display">Members</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Undang Partner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email partner"
              className="flex-1"
              required
            />
            <Button type="submit">Undang</Button>
          </form>
          {error && <div className="text-destructive text-sm">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Memuat...</p>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground">Belum ada anggota.</p>
          ) : (
            <div className="space-y-0">
              {members.map((m, i) => (
                <div key={m.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium">{m.user.name}</div>
                      <div className="text-sm text-muted-foreground">{m.user.email}</div>
                    </div>
                    <Badge variant={m.role === "OWNER" ? "default" : "secondary"}>
                      {m.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
