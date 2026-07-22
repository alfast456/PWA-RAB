import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";
import WeddingNav from "./nav";

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
    <div className="flex-1 flex flex-col">
      <WeddingNav weddingId={weddingId} weddingName={wedding.name} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
