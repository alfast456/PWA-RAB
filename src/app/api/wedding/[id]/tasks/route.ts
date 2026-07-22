import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";
import { taskCreateSchema } from "@/lib/validators/task";

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
    const status = url.searchParams.get("status");
    const sort = url.searchParams.get("sort") || "dueDate";

    const where: Record<string, unknown> = { weddingId: id };
    if (status) {
      where.status = status;
    }

    const orderBy: Record<string, string> = {};
    if (sort === "dueDate") {
      orderBy.dueDate = "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, email: true, name: true } },
      },
      orderBy,
    });

    return NextResponse.json(tasks);
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
    const parsed = taskCreateSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        weddingId: id,
        title: parsed.title,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        assignedToId: parsed.assignedToId,
      },
      include: {
        assignedTo: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
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
