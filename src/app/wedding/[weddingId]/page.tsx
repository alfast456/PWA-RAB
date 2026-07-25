"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LedgerRow } from "@/components/wedding/ledger-row";
import { StatusBadge } from "@/components/wedding/status-badge";
import { SectionHeading } from "@/components/wedding/section-heading";

interface Summary {
  totalBudget: number;
  totalActual: number;
  remaining: number;
  categoriesOverBudget: string[];
  upcomingPayments: { vendorName: string; amount: number; dueDate: string }[];
  taskProgress: { total: number; selesai: number };
}

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function WeddingDashboardPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;

  const { data: summary, isLoading: loading } = useSWR<Summary>(`/api/wedding/${weddingId}/summary`, fetcher);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        Memuat...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center p-6 text-destructive">
        Gagal memuat ringkasan
      </div>
    );
  }

  const isOverBudget = summary.remaining < 0;
  const progressVal =
    summary.taskProgress.total > 0
      ? (summary.taskProgress.selesai / summary.taskProgress.total) * 100
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <SectionHeading title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Ringkasan Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Budget
                </div>
                <div className="font-display text-2xl tabular-nums mt-1">
                  {fmt(summary.totalBudget)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Aktual
                </div>
                <div className="font-display text-2xl tabular-nums mt-1">
                  {fmt(summary.totalActual)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Sisa</div>
                <div className="font-display text-2xl tabular-nums mt-1">
                  {fmt(summary.remaining)}
                </div>
                <StatusBadge
                  variant={isOverBudget ? "over" : "aman"}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Progress Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Tugas Selesai</span>
              <span className="text-muted-foreground">
                {summary.taskProgress.selesai} / {summary.taskProgress.total}
              </span>
            </div>
            <Progress value={progressVal} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Kategori Over Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.categoriesOverBudget.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Semua kategori masih dalam batas budget.
              </p>
            ) : (
              <div className="space-y-2">
                {summary.categoriesOverBudget.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm truncate">{cat}</span>
                    <StatusBadge variant="over" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Pembayaran Mendatang (7 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.upcomingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tidak ada pembayaran mendatang.
              </p>
            ) : (
              <div className="space-y-1">
                {summary.upcomingPayments.map((p, idx) => {
                  const isPast = p.dueDate && new Date(p.dueDate) < new Date();
                  return (
                    <LedgerRow
                      key={idx}
                      label={p.vendorName}
                      sublabel={
                        p.dueDate
                          ? new Date(p.dueDate).toLocaleDateString("id-ID")
                          : undefined
                      }
                      value={fmt(p.amount)}
                    >
                      <StatusBadge
                        variant={isPast ? "overdue" : "jatuh-tempo"}
                      />
                    </LedgerRow>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
