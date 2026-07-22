"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error?.message || "Pendaftaran gagal");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Daftar</h1>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            minLength={8}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
