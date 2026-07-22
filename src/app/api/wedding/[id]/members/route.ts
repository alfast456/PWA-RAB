import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";
import { memberInviteSchema } from "@/lib/validators/member";

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

    const members = await prisma.weddingMember.findMany({
      where: { weddingId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(members);
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
    const parsed = memberInviteSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User dengan email tersebut belum terdaftar" } },
        { status: 404 }
      );
    }

    const existing = await prisma.weddingMember.findUnique({
      where: {
        weddingId_userId: {
          weddingId: id,
          userId: targetUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "User sudah menjadi member wedding ini" } },
        { status: 400 }
      );
    }

    const member = await prisma.weddingMember.create({
      data: {
        weddingId: id,
        userId: targetUser.id,
        role: "PARTNER",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
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
