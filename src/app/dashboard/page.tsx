"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Selamat datang. Pilih atau buat wedding baru di bawah.
        </p>
        <a
          href="/wedding/new"
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800"
        >
          Buat Wedding Baru
        </a>
      </div>
    </main>
  );
}