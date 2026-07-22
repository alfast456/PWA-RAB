import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, categoryId } = await params;
    await assertWeddingMember(session.user.id, id);

    const category = await prisma.category.findFirst({
      where: { id: categoryId, weddingId: id },
    });

    if (!category) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Kategori tidak ditemukan" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name } = body;

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name },
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
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, categoryId } = await params;
    await assertWeddingMember(session.user.id, id);

    const category = await prisma.category.findFirst({
      where: { id: categoryId, weddingId: id },
    });

    if (!category) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Kategori tidak ditemukan" } },
        { status: 404 }
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });

    return NextResponse.json({ message: "Kategori berhasil dihapus" });
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
