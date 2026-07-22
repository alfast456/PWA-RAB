"use client";

import { useState, useEffect } from "react";

interface Member {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  role: string;
}

export default function MembersPage({ params }: { params: { weddingId: string } }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/wedding/${params.weddingId}/members`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        }
      })
      .finally(() => setLoading(false));
  }, [params.weddingId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/wedding/${params.weddingId}/members`, {
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
      setMembers((prev) => [...prev, data]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold">Members</h2>

      <form onSubmit={handleInvite} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email partner"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Undang
        </button>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="rounded-lg border p-3 flex justify-between">
              <div>
                <div className="font-medium">{m.user.name}</div>
                <div className="text-sm text-gray-600">{m.user.email}</div>
              </div>
              <div className="text-sm text-gray-500">{m.role}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
