import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getSummary(weddingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/wedding/${weddingId}/summary`,
    { headers: { cookie: "" }, cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

interface Summary {
  totalBudget: number;
  totalActual: number;
  remaining: number;
  categoriesOverBudget: string[];
  upcomingPayments: { vendorName: string; amount: number; dueDate: string | Date }[];
  taskProgress: { total: number; selesai: number };
}

export default async function WeddingDashboardPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const summary = (await getSummary(weddingId)) as Summary | null;

  if (!summary) {
    return <div className="p-6">Gagal memuat ringkasan</div>;
  }

  const progress =
    summary.taskProgress.total > 0
      ? Math.round((summary.taskProgress.selesai / summary.taskProgress.total) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Budget</div>
          <div className="text-xl font-semibold">
            {summary.totalBudget.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Actual</div>
          <div className="text-xl font-semibold">
            {summary.totalActual.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-600">Sisa</div>
          <div
            className={`text-xl font-semibold ${
              summary.remaining < 0 ? "text-red-600" : ""
            }`}
          >
            {summary.remaining.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {summary.categoriesOverBudget.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="font-semibold text-red-800">Kategori Over Budget</div>
          <ul className="list-disc list-inside text-red-700">
            {summary.categoriesOverBudget.map((cat) => (
              <li key={cat}>{cat}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Pembayaran Mendatang (7 hari)</h3>
          {summary.upcomingPayments.length === 0 ? (
            <p className="text-gray-600 text-sm">Tidak ada pembayaran mendatang.</p>
          ) : (
            <ul className="space-y-2">
              {summary.upcomingPayments.map((p, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium">{p.vendorName}</span> —{" "}
                  {p.amount.toLocaleString("id-ID")} —{" "}
                  {new Date(p.dueDate).toLocaleDateString("id-ID")}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Progress Checklist</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-black h-4 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {summary.taskProgress.selesai} / {summary.taskProgress.total} selesai
          </p>
        </div>
      </div>
    </div>
  );
}
