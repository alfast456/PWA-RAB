"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau password salah");
      setLoading(false);
    } else {
      window.location.href = "/wedding";
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

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
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Daftar
          </a>
        </p>
      </form>
    </main>
  );
}
