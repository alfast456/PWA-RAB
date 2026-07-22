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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LedgerRow } from "@/components/wedding/ledger-row";
import { StatusBadge } from "@/components/wedding/status-badge";
import { SectionHeading } from "@/components/wedding/section-heading";
import { StickyActionBar } from "@/components/wedding/sticky-action-bar";
import { Plus, Pencil, Trash, CheckCircle, Save } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  contact?: string | null;
  totalContract?: number | null;
}

interface Payment {
  id: string;
  type: string;
  amount: number;
  dueDate?: string | null;
  status: string;
  paidAt?: string | null;
  vendorId: string;
  vendorName: string;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function VendorsPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorContract, setVendorContract] = useState("");

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentVendorId, setPaymentVendorId] = useState("");
  const [paymentType, setPaymentType] = useState("DP");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");

  const fetchData = useCallback(async () => {
    const [vRes, pRes] = await Promise.all([
      fetch(`/api/wedding/${weddingId}/vendors`),
      fetch(`/api/wedding/${weddingId}/payments`),
    ]);
    const vData = await vRes.json();
    const pData = await pRes.json();
    if (Array.isArray(vData)) setVendors(vData);
    if (Array.isArray(pData)) setPayments(pData);
    setLoading(false);
  }, [weddingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddVendor = () => {
    setEditingVendor(null);
    setVendorName("");
    setVendorContact("");
    setVendorContract("");
    setVendorDialogOpen(true);
  };

  const openEditVendor = (v: Vendor) => {
    setEditingVendor(v);
    setVendorName(v.name);
    setVendorContact(v.contact || "");
    setVendorContract(v.totalContract ? String(v.totalContract) : "");
    setVendorDialogOpen(true);
  };

  const saveVendor = async () => {
    const payload = {
      name: vendorName,
      contact: vendorContact || undefined,
      totalContract: parseFloat(vendorContract) || undefined,
    };
    if (editingVendor) {
      const res = await fetch(`/api/wedding/${weddingId}/vendors/${editingVendor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setVendors(vendors.map((v) => (v.id === updated.id ? updated : v)));
      }
    } else {
      const res = await fetch(`/api/wedding/${weddingId}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setVendors([...vendors, created]);
      }
    }
    setVendorDialogOpen(false);
  };

  const deleteVendor = async (id: string) => {
    const res = await fetch(`/api/wedding/${weddingId}/vendors/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setVendors(vendors.filter((v) => v.id !== id));
      setPayments(payments.filter((p) => p.vendorId !== id));
    }
  };

  const openAddPayment = (vendorId: string) => {
    setPaymentVendorId(vendorId);
    setPaymentType("DP");
    setPaymentAmount("");
    setPaymentDueDate("");
    setPaymentDialogOpen(true);
  };

  const savePayment = async () => {
    const res = await fetch(`/api/wedding/${weddingId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId: paymentVendorId,
        type: paymentType,
        amount: parseFloat(paymentAmount) || 0,
        dueDate: paymentDueDate || undefined,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setPayments([...payments, created]);
    }
    setPaymentDialogOpen(false);
  };

  const markPaid = async (id: string) => {
    const res = await fetch(`/api/wedding/${weddingId}/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SUDAH_BAYAR", paidAt: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPayments(payments.map((p) => (p.id === id ? updated : p)));
    }
  };

  const deletePayment = async (id: string) => {
    const res = await fetch(`/api/wedding/${weddingId}/payments/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  const getStatusBadge = (p: Payment) => {
    if (p.status === "SUDAH_BAYAR") return <StatusBadge variant="lunas" />;
    if (!p.dueDate) return <StatusBadge variant="belum" label="Belum Bayar" />;
    const due = new Date(p.dueDate);
    const now = new Date();
    if (due < now) return <StatusBadge variant="overdue" />;
    return <StatusBadge variant="jatuh-tempo" />;
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
        <h2 className="font-display text-2xl">Vendor & Pembayaran</h2>
        <Button onClick={openAddVendor} className="hidden md:flex">
          <Plus className="w-4 h-4 mr-2" /> Tambah Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            Belum ada vendor. Tambahkan vendor untuk memulai.
          </p>
        )}
        {vendors.map((v) => {
          const vPayments = payments.filter((p) => p.vendorId === v.id);
          return (
            <Card key={v.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display text-xl truncate">{v.name}</h3>
                    {v.contact && (
                      <p className="text-sm text-muted-foreground">
                        {v.contact}
                      </p>
                    )}
                    {v.totalContract && (
                      <p className="text-sm font-medium mt-1 tabular-nums">
                        Kontrak: {fmt(v.totalContract)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditVendor(v)}
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
                          <AlertDialogTitle>Hapus Vendor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Vendor &quot;{v.name}&quot; dan semua pembayarannya akan dihapus.
                            Lanjutkan?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteVendor(v.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <SectionHeading title="Pembayaran" className="text-base" />

                <div className="space-y-2 mb-4">
                  {vPayments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Belum ada jadwal pembayaran.
                    </p>
                  ) : (
                    vPayments.map((p) => (
                      <LedgerRow
                        key={p.id}
                        label={p.type}
                        sublabel={
                          p.dueDate
                            ? new Date(p.dueDate).toLocaleDateString("id-ID")
                            : undefined
                        }
                        value={fmt(p.amount)}
                      >
                        {getStatusBadge(p)}
                        {p.status !== "SUDAH_BAYAR" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markPaid(p.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Tandai Lunas
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash className="w-4 h-4 mr-2" /> Hapus
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pembayaran</AlertDialogTitle>
                              <AlertDialogDescription>
                                Pembayaran ini akan dihapus. Lanjutkan?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePayment(p.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </LedgerRow>
                    ))
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAddPayment(v.id)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Pembayaran
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="md:hidden">
        <StickyActionBar>
          <Button onClick={openAddVendor} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Tambah Vendor
          </Button>
        </StickyActionBar>
      </div>

      <Sheet open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl flex flex-col p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>
              {editingVendor ? "Edit Vendor" : "Tambah Vendor"}
            </SheetTitle>
            <SheetDescription>
              {editingVendor ? "Ubah detail vendor." : "Masukkan data vendor baru."}
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vName">Nama Vendor</Label>
                <Input
                  id="vName"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vContact">Kontak</Label>
                <Input
                  id="vContact"
                  value={vendorContact}
                  onChange={(e) => setVendorContact(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vContract">Total Kontrak</Label>
                <Input
                  id="vContract"
                  type="number"
                  value={vendorContract}
                  onChange={(e) => setVendorContract(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-card border-t border-border p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
            <Button size="lg" className="w-full h-11" onClick={saveVendor} disabled={!vendorName.trim()}>
              <Save className="mr-2 h-4 w-4" /> Simpan
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl flex flex-col p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Tambah Pembayaran</SheetTitle>
            <SheetDescription>Masukkan jadwal pembayaran.</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DP">DP</SelectItem>
                    <SelectItem value="CICILAN">Cicilan</SelectItem>
                    <SelectItem value="PELUNASAN">Pelunasan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pAmount">Jumlah</Label>
                <Input
                  id="pAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pDue">Jatuh Tempo (Opsional)</Label>
                <Input
                  id="pDue"
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-card border-t border-border p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
            <Button size="lg" className="w-full h-11" onClick={savePayment} disabled={!paymentAmount.trim()}>
              <Save className="mr-2 h-4 w-4" /> Simpan
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
