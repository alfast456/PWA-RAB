import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, taskId } = await params;
    await assertWeddingMember(session.user.id, id);

    const task = await prisma.task.findFirst({
      where: { id: taskId },
    });

    if (!task || task.weddingId !== id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Task tidak ditemukan" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, dueDate, status, assignedToId } = body;

    if (assignedToId !== undefined && assignedToId !== null) {
      const member = await prisma.weddingMember.findFirst({
        where: { weddingId: id, userId: assignedToId },
      });

      if (!member) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Member Target tidak ditemukan" } },
          { status: 404 }
        );
      }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status !== undefined && { status }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        assignedTo: { select: { id: true, email: true, name: true } },
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
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Silakan login terlebih dahulu" } },
        { status: 401 }
      );
    }

    const { id, taskId } = await params;
    await assertWeddingMember(session.user.id, id);

    const task = await prisma.task.findFirst({
      where: { id: taskId },
    });

    if (!task || task.weddingId !== id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Task tidak ditemukan" } },
        { status: 404 }
      );
    }

    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ message: "Task berhasil dihapus" });
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
