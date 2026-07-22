import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";
import { budgetItemCreateSchema } from "@/lib/validators/budget-item";

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
    const categoryId = url.searchParams.get("categoryId");

    const where = categoryId ? { categoryId } : {};

    const items = await prisma.budgetItem.findMany({
      where,
      include: {
        category: true,
      },
    });

    return NextResponse.json(items);
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
    const parsed = budgetItemCreateSchema.parse(body);

    const category = await prisma.category.findFirst({
      where: { id: parsed.categoryId, weddingId: id },
    });

    if (!category) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Kategori tidak ditemukan" } },
        { status: 404 }
      );
    }

    const item = await prisma.budgetItem.create({
      data: {
        categoryId: parsed.categoryId,
        name: parsed.name,
        budgetAmount: parsed.budgetAmount,
        actualAmount: parsed.actualAmount ?? 0,
        notes: parsed.notes,
      },
    });

    return NextResponse.json(item, { status: 201 });
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
