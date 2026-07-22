import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/wedding");
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Wedding RAB Planner</h1>
        <p className="text-gray-600">
          Rencana Anggaran Biaya Pernikahan untuk wedding planner kalian bersama.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            Login
          </a>
          <a
            href="/register"
            className="rounded-md border border-gray-300 px-6 py-2 hover:bg-gray-50"
          >
            Daftar
          </a>
        </div>
      </div>
    </main>
  );
}
