import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, vendorId } = await params;
    await assertWeddingMember(session.user.id, id);

    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, weddingId: id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vendor tidak ditemukan" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, categoryId, contact, totalContract } = body;

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, weddingId: id },
      });

      if (!category) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Kategori tidak ditemukan" } },
          { status: 404 }
        );
      }
    }

    const updated = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(name !== undefined && { name }),
        ...(categoryId !== undefined && { categoryId }),
        ...(contact !== undefined && { contact }),
        ...(totalContract !== undefined && { totalContract }),
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
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, vendorId } = await params;
    await assertWeddingMember(session.user.id, id);

    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, weddingId: id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vendor tidak ditemukan" } },
        { status: 404 }
      );
    }

    await prisma.vendor.delete({ where: { id: vendorId } });

    return NextResponse.json({ message: "Vendor berhasil dihapus" });
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
