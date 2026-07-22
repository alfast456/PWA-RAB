import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, paymentId } = await params;
    await assertWeddingMember(session.user.id, id);

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId },
      include: { vendor: true },
    });

    if (!payment || payment.vendor.weddingId !== id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Pembayaran tidak ditemukan" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, paidAt } = body;

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        ...(status !== undefined && { status }),
        ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
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
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, paymentId } = await params;
    await assertWeddingMember(session.user.id, id);

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId },
      include: { vendor: true },
    });

    if (!payment || payment.vendor.weddingId !== id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Pembayaran tidak ditemukan" } },
        { status: 404 }
      );
    }

    await prisma.payment.delete({ where: { id: paymentId } });

    return NextResponse.json({ message: "Pembayaran berhasil dihapus" });
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
