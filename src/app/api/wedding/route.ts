import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { weddingCreateSchema } from "@/lib/validators/wedding";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const weddings = await prisma.wedding.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(weddings);
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = weddingCreateSchema.parse(body);

    const wedding = await prisma.wedding.create({
      data: {
        name: parsed.name,
        weddingDate: parsed.weddingDate ? new Date(parsed.weddingDate) : null,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json(wedding, { status: 201 });
  } catch (error) {
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
