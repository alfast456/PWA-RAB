import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";
import { BottomNav } from "@/components/wedding/bottom-nav";
import Link from "next/link";
import { Home, Wallet, Store, CheckSquare, Users } from "lucide-react";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { weddingId } = await params;

  try {
    await assertWeddingMember(session.user.id, weddingId);
  } catch {
    redirect("/wedding");
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { id: true, name: true, weddingDate: true },
  });

  if (!wedding) {
    notFound();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 border-r bg-muted/30">
        <div className="p-6 border-b">
          <h2 className="font-display font-bold text-lg truncate">{wedding.name}</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href={`/wedding/${weddingId}`} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
            <Home className="h-4 w-4" /> Dashboard
          </Link>
          <Link href={`/wedding/${weddingId}/rab`} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
            <Wallet className="h-4 w-4" /> Budget
          </Link>
          <Link href={`/wedding/${weddingId}/vendors`} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
            <Store className="h-4 w-4" /> Vendors
          </Link>
          <Link href={`/wedding/${weddingId}/checklist`} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
            <CheckSquare className="h-4 w-4" /> Checklist
          </Link>
          <Link href={`/wedding/${weddingId}/members`} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
            <Users className="h-4 w-4" /> Member
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-6 relative">
        <div className="md:hidden border-b p-4 sticky top-0 bg-background z-10 shadow-sm">
          <h2 className="font-display font-bold text-lg truncate">{wedding.name}</h2>
        </div>
        {children}
      </main>
      
      <div className="md:hidden">
        <BottomNav weddingId={weddingId} />
      </div>
    </div>
  );
}
