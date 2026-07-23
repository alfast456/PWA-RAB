import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";
import { paymentCreateSchema } from "@/lib/validators/payment";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await assertWeddingMember(session.user.id, id);

    const url = new URL(request.url);
    const vendorId = url.searchParams.get("vendorId");
    const status = url.searchParams.get("status");
    const upcoming = url.searchParams.get("upcoming");

    const where: Record<string, unknown> = {
      vendor: { weddingId: id },
    };

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (status) {
      where.status = status;
    }

    let payments = await prisma.payment.findMany({
      where,
      include: { vendor: true },
      orderBy: { dueDate: "asc" },
    });

    if (upcoming === "true") {
      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(now.getDate() + 7);

      payments = payments.filter((p: { dueDate?: string | Date | null; status: string }) => {
        if (!p.dueDate || p.status !== "BELUM_BAYAR") return false;
        const due = new Date(p.dueDate);
        return due >= now && due <= in7Days;
      });
    }

    return NextResponse.json(payments);
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await assertWeddingMember(session.user.id, id);

    const body = await request.json();
    const parsed = paymentCreateSchema.parse(body);

    const vendor = await prisma.vendor.findFirst({
      where: { id: parsed.vendorId, weddingId: id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vendor tidak ditemukan" } },
        { status: 404 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        vendorId: parsed.vendorId,
        type: parsed.type,
        amount: parsed.amount,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      },
      include: { vendor: true },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Anda bukan member wedding ini" } },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server" } },
      { status: 500 }
    );
  }
}
