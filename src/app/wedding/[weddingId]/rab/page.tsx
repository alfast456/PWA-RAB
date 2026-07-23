"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { SectionHeading } from "@/components/wedding/section-heading";
import { LedgerRow } from "@/components/wedding/ledger-row";
import { StatusBadge } from "@/components/wedding/status-badge";
import { StickyActionBar } from "@/components/wedding/sticky-action-bar";
import { Plus, Pencil, Trash, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
  totalBudget?: number;
  totalActual?: number;
}

interface BudgetItem {
  id: string;
  categoryId: string;
  name: string;
  budgetAmount: number;
  actualAmount: number;
  notes?: string | null;
}

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

export default function RabPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemBudget, setItemBudget] = useState("");
  const [itemActual, setItemActual] = useState("");
  const [itemNotes, setItemNotes] = useState("");

  const fetchData = useCallback(async () => {
    const [catRes, itemRes, sumRes] = await Promise.all([
      fetch(`/api/wedding/${weddingId}/categories`),
      fetch(`/api/wedding/${weddingId}/budget-items`),
      fetch(`/api/wedding/${weddingId}/summary`),
    ]);
    const catData = await catRes.json();
    const itemData = await itemRes.json();
    if (Array.isArray(catData)) setCategories(catData);
    if (Array.isArray(itemData)) setItems(itemData);
    if (sumRes.ok) setSummary(await sumRes.json());
    setLoading(false);
  }, [weddingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCategoryItems = (catId: string) =>
    items.filter((i) => i.categoryId === catId);

  const getCategoryTotal = (catId: string) => {
    const catItems = getCategoryItems(catId);
    return {
      budget: catItems.reduce((s, i) => s + i.budgetAmount, 0),
      actual: catItems.reduce((s, i) => s + i.actualAmount, 0),
    };
  };

  const totalBudget = summary?.totalBudget ?? items.reduce((s, i) => s + i.budgetAmount, 0);
  const totalActual = summary?.totalActual ?? items.reduce((s, i) => s + i.actualAmount, 0);
  const remaining = summary?.remaining ?? totalBudget - totalActual;
  const isOver = remaining < 0;

  const openAddCategory = () => {
    setEditingCat(null);
    setCatName("");
    setCatDialogOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDialogOpen(true);
  };

  const saveCategory = async () => {
    if (editingCat) {
      const res = await fetch(
        `/api/wedding/${weddingId}/categories/${editingCat.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catName }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setCategories(categories.map((c) => (c.id === updated.id ? updated : c)));
      }
    } else {
      const res = await fetch(`/api/wedding/${weddingId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName }),
      });
      if (res.ok) {
        const created = await res.json();
        setCategories([...categories, created]);
      }
    }
    setCatDialogOpen(false);
  };

  const deleteCategory = async (catId: string) => {
    const res = await fetch(`/api/wedding/${weddingId}/categories/${catId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCategories(categories.filter((c) => c.id !== catId));
      setItems(items.filter((i) => i.categoryId !== catId));
      fetchData();
    }
  };

  const openAddItem = (categoryId: string) => {
    setEditingItem(null);
    setItemCategoryId(categoryId);
    setItemName("");
    setItemBudget("");
    setItemActual("");
    setItemNotes("");
    setItemDialogOpen(true);
  };

  const openEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setItemCategoryId(item.categoryId);
    setItemName(item.name);
    setItemBudget(String(item.budgetAmount));
    setItemActual(String(item.actualAmount));
    setItemNotes(item.notes || "");
    setItemDialogOpen(true);
  };

  const saveItem = async () => {
    const payload = {
      categoryId: itemCategoryId,
      name: itemName,
      budgetAmount: parseFloat(itemBudget) || 0,
      actualAmount: parseFloat(itemActual) || 0,
      notes: itemNotes || undefined,
    };
    if (editingItem) {
      const res = await fetch(
        `/api/wedding/${weddingId}/budget-items/${editingItem.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setItems(items.map((i) => (i.id === updated.id ? updated : i)));
        fetchData();
      }
    } else {
      const res = await fetch(`/api/wedding/${weddingId}/budget-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setItems([...items, created]);
        fetchData();
      }
    }
    setItemDialogOpen(false);
  };

  const deleteItem = async (itemId: string) => {
    const res = await fetch(
      `/api/wedding/${weddingId}/budget-items/${itemId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setItems(items.filter((i) => i.id !== itemId));
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        Memuat...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Rencana Anggaran Biaya</h2>
        <Button onClick={openAddCategory} className="hidden md:flex">
          <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
              <div className="font-display text-2xl tabular-nums">
                {fmt(totalBudget)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Aktual</div>
              <div className="font-display text-2xl tabular-nums">
                {fmt(totalActual)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sisa</div>
              <div className="font-display text-2xl tabular-nums">
                {fmt(remaining)}
              </div>
              <StatusBadge
                variant={isOver ? "over" : "aman"}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Belum ada kategori. Tambahkan kategori untuk memulai.
          </p>
        )}
        {categories.map((cat) => {
          const totals = getCategoryTotal(cat.id);
          const catItems = getCategoryItems(cat.id);
          const catOver = totals.actual > totals.budget && totals.budget > 0;

          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <SectionHeading
                    title={cat.name}
                    value={fmt(totals.budget)}
                  />
                </div>
                {catOver && <StatusBadge variant="over" />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditCategory(cat)}
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash className="w-4 h-4 mr-2" /> Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                      <AlertDialogDescription>
                        Kategori &quot;{cat.name}&quot; dan semua item di
                        dalamnya akan dihapus. Lanjutkan?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCategory(cat.id)}>
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {catItems.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-1">
                  Belum ada item.
                </p>
              ) : (
                catItems.map((item) => (
                  <LedgerRow
                    key={item.id}
                    label={item.name}
                    value={`${fmt(item.actualAmount)} / ${fmt(item.budgetAmount)}`}
                    sublabel={item.notes || undefined}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditItem(item)}
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash className="w-4 h-4 mr-2" /> Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Item &quot;{item.name}&quot; akan dihapus.
                            Lanjutkan?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteItem(item.id)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </LedgerRow>
                ))
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => openAddItem(cat.id)}
              >
                <Plus className="w-4 h-4 mr-2" /> Item
              </Button>
            </div>
          );
        })}
      </div>

      <div className="md:hidden">
        <StickyActionBar>
          <Button onClick={openAddCategory} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
          </Button>
        </StickyActionBar>
      </div>

      <Sheet open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl flex flex-col p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>
              {editingCat ? "Edit Kategori" : "Tambah Kategori"}
            </SheetTitle>
            <SheetDescription>
              {editingCat
                ? "Ubah nama kategori."
                : "Masukkan nama kategori baru."}
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catName">Nama Kategori</Label>
                <Input
                  id="catName"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Nama kategori"
                  required
                />
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-card border-t border-border p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
            <Button size="lg" className="w-full h-11" onClick={saveCategory} disabled={!catName.trim()}>
              <Save className="mr-2 h-4 w-4" /> Simpan
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl flex flex-col p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>
              {editingItem ? "Edit Item" : "Tambah Item"}
            </SheetTitle>
            <SheetDescription>
              {editingItem
                ? "Ubah detail budget item."
                : "Masukkan detail budget item baru."}
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Nama Item</Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Nama item"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemBudget">Budget</Label>
                  <Input
                    id="itemBudget"
                    type="number"
                    value={itemBudget}
                    onChange={(e) => setItemBudget(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemActual">Aktual</Label>
                  <Input
                    id="itemActual"
                    type="number"
                    value={itemActual}
                    onChange={(e) => setItemActual(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemNotes">Catatan</Label>
                <Input
                  id="itemNotes"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Catatan (opsional)"
                />
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-card border-t border-border p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
            <Button size="lg" className="w-full h-11" onClick={saveItem} disabled={!itemName.trim()}>
              <Save className="mr-2 h-4 w-4" /> Simpan
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
