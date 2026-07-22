"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

interface BudgetItem {
  id: string;
  categoryId: string;
  name: string;
  budgetAmount: number;
  actualAmount: number;
  notes?: string | null;
}

export default function RabPage({ params }: { params: { weddingId: string } }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newItem, setNewItem] = useState({ categoryId: "", name: "", budgetAmount: "", actualAmount: "", notes: "" });

  useEffect(() => {
    fetch(`/api/wedding/${params.weddingId}/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      });
    fetch(`/api/wedding/${params.weddingId}/budget-items`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .finally(() => setLoading(false));
  }, [params.weddingId]);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/wedding/${params.weddingId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories([...categories, cat]);
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const catId = categories[0]?.id;
    if (!catId) return;

    const res = await fetch(`/api/wedding/${params.weddingId}/budget-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: catId,
        name: newItem.name,
        budgetAmount: parseFloat(newItem.budgetAmount) || 0,
        actualAmount: parseFloat(newItem.actualAmount) || 0,
        notes: newItem.notes,
      }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems([...items, item]);
      setNewItem({ categoryId: "", name: "", budgetAmount: "", actualAmount: "", notes: "" });
    }
  };

  const getCategoryItems = (catId: string) => items.filter((i) => i.categoryId === catId);

  const getCategoryTotal = (catId: string) => {
    const catItems = getCategoryItems(catId);
    return {
      budget: catItems.reduce((sum, i) => sum + i.budgetAmount, 0),
      actual: catItems.reduce((sum, i) => sum + i.actualAmount, 0),
    };
  };

  const totalBudget = items.reduce((sum, i) => sum + i.budgetAmount, 0);
  const totalActual = items.reduce((sum, i) => sum + i.actualAmount, 0);

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Rencana Anggaran Biaya</h2>
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Tambah Kategori
        </button>
      </div>

      {showAddCategory && (
        <form onSubmit={addCategory} className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nama kategori"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
            required
          />
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
            Simpan
          </button>
        </form>
      )}

      <div className="rounded-lg border p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Total Budget</div>
            <div className="text-lg font-semibold">{totalBudget.toLocaleString("id-ID")}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Actual</div>
            <div className="text-lg font-semibold">{totalActual.toLocaleString("id-ID")}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Sisa</div>
            <div className={`text-lg font-semibold ${totalActual > totalBudget ? "text-red-600" : ""}`}>
              {(totalBudget - totalActual).toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          const catItems = getCategoryItems(cat.id);
          const totals = getCategoryTotal(cat.id);
          const isOverBudget = totals.actual > totals.budget;

          return (
            <div key={cat.id} className="rounded-lg border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold">{cat.name}</div>
                  <div className="text-sm text-gray-600">
                    Budget: {totals.budget.toLocaleString("id-ID")} | Actual:{" "}
                    {totals.actual.toLocaleString("id-ID")}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-sm ${
                    isOverBudget ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {isOverBudget ? "Over Budget" : "On Track"}
                </div>
              </div>

              <div className="px-4 pb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="pb-2">Nama</th>
                      <th className="pb-2">Budget</th>
                      <th className="pb-2">Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">{item.budgetAmount.toLocaleString("id-ID")}</td>
                        <td className="py-2">{item.actualAmount.toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">Tambah Budget Item</summary>
                  <form onSubmit={addItem} className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      type="hidden"
                      value={cat.id}
                      onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Nama item"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="rounded-md border border-gray-300 px-2 py-1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Budget"
                      value={newItem.budgetAmount}
                      onChange={(e) => setNewItem({ ...newItem, budgetAmount: e.target.value })}
                      className="rounded-md border border-gray-300 px-2 py-1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Actual"
                      value={newItem.actualAmount}
                      onChange={(e) => setNewItem({ ...newItem, actualAmount: e.target.value })}
                      className="rounded-md border border-gray-300 px-2 py-1"
                    />
                    <button type="submit" className="rounded-md bg-black px-3 py-1 text-white hover:bg-gray-800">
                      Tambah
                    </button>
                  </form>
                </details>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
