import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, itemId } = await params;
    await assertWeddingMember(session.user.id, id);

    const item = await prisma.budgetItem.findFirst({
      where: { id: itemId },
      include: { category: true },
    });

    if (!item || item.category.weddingId !== id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Budget item tidak ditemukan" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, budgetAmount, actualAmount, notes } = body;

    const updated = await prisma.budgetItem.update({
      where: { id: itemId },
      data: {
        ...(name !== undefined && { name }),
        ...(budgetAmount !== undefined && { budgetAmount }),
        ...(actualAmount !== undefined && { actualAmount }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Anda bukan member wedding ini" } },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, itemId } = await params;
    await assertWeddingMember(session.user.id, id);

    const item = await prisma.budgetItem.findFirst({
      where: { id: itemId },
      include: { category: true },
    });

    if (!item || item.category.weddingId !== id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Budget item tidak ditemukan" } },
        { status: 404 }
      );
    }

    await prisma.budgetItem.delete({ where: { id: itemId } });

    return NextResponse.json({ message: "Budget item berhasil dihapus" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Anda bukan member wedding ini" } },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server" } },
      { status: 500 }
    );
  }
}
