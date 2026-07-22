import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertWeddingMember } from "@/lib/tenant-guard";

interface BudgetGroup {
   _sum: { budgetAmount: Prisma.Decimal | null; actualAmount: Prisma.Decimal | null };
}
 
interface CategoryWithItems {
   name: string;
   budgetItems: { budgetAmount: Prisma.Decimal | null; actualAmount: Prisma.Decimal | null }[];
}
 
interface PaymentWithVendor {
   vendor: { name: string };
   amount: Prisma.Decimal;
   dueDate: string | Date | null;
}

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

    const budgetAgg = await prisma.budgetItem.groupBy({
      by: ["categoryId"],
      where: { category: { weddingId: id } },
      _sum: { budgetAmount: true, actualAmount: true },
    });

    const totalBudget = budgetAgg.reduce((acc: number, curr: BudgetGroup) => acc + Number(curr._sum.budgetAmount || 0), 0);
    const totalActual = budgetAgg.reduce((acc: number, curr: BudgetGroup) => acc + Number(curr._sum.actualAmount || 0), 0);

    const overBudgetCategories = await prisma.category.findMany({
      where: { weddingId: id },
      include: {
        budgetItems: {
          select: { budgetAmount: true, actualAmount: true },
        },
      },
    });

    const categoriesOverBudget = overBudgetCategories
      .filter((cat: CategoryWithItems) => {
        const catBudget = cat.budgetItems.reduce((acc: number, item) => acc + Number(item.budgetAmount || 0), 0);
        const catActual = cat.budgetItems.reduce((acc: number, item) => acc + Number(item.actualAmount || 0), 0);
        return catActual > catBudget;
      })
      .map((cat: CategoryWithItems) => cat.name);

    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    const upcomingPayments = await prisma.payment.findMany({
      where: {
        vendor: { weddingId: id },
        dueDate: { gte: now, lte: in7Days },
        status: "BELUM_BAYAR",
      },
      include: { vendor: true },
      orderBy: { dueDate: "asc" },
    });

    const [totalTasks, completedTasks] = await Promise.all([
      prisma.task.count({ where: { weddingId: id } }),
      prisma.task.count({
        where: { weddingId: id, status: "SELESAI" },
      }),
    ]);

    return NextResponse.json({
      totalBudget,
      totalActual,
      remaining: totalBudget - totalActual,
      categoriesOverBudget,
      upcomingPayments: upcomingPayments.map((p: PaymentWithVendor) => ({
        vendorName: p.vendor.name,
        amount: Number(p.amount),
        dueDate: p.dueDate,
      })),
      taskProgress: {
        total: totalTasks,
        selesai: completedTasks,
      },
    });
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
