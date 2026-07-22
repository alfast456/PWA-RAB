"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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

export default function VendorsPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [newVendor, setNewVendor] = useState({ name: "", contact: "", totalContract: "" });
  const [newPayment, setNewPayment] = useState({ vendorId: "", type: "DP", amount: "", dueDate: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/wedding/${weddingId}/vendors`).then((res) => res.json()),
      fetch(`/api/wedding/${weddingId}/payments`).then((res) => res.json()),
    ])
      .then(([dataVendors, dataPayments]) => {
        if (Array.isArray(dataVendors)) setVendors(dataVendors);
        if (Array.isArray(dataPayments)) setPayments(dataPayments);
      })
      .finally(() => setLoading(false));
  }, [weddingId]);

  const addVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/wedding/${weddingId}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newVendor.name,
        contact: newVendor.contact || undefined,
        totalContract: parseFloat(newVendor.totalContract) || undefined,
      }),
    });
    if (res.ok) {
      const vendor = await res.json();
      setVendors([...vendors, vendor]);
      setNewVendor({ name: "", contact: "", totalContract: "" });
      setShowAddVendor(false);
    }
  };

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/wedding/${weddingId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId: newPayment.vendorId,
        type: newPayment.type,
        amount: parseFloat(newPayment.amount) || 0,
        dueDate: newPayment.dueDate || undefined,
      }),
    });
    if (res.ok) {
      const payment = await res.json();
      setPayments([...payments, payment]);
      setNewPayment({ vendorId: "", type: "DP", amount: "", dueDate: "" });
      setShowAddPayment(false);
    }
  };

  const markAsPaid = async (paymentId: string) => {
    const res = await fetch(`/api/wedding/${weddingId}/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SUDAH_BAYAR", paidAt: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPayments(payments.map((p) => (p.id === paymentId ? updated : p)));
    }
  };

  const getVendorPayments = (vendorId: string) => payments.filter((p) => p.vendorId === vendorId);

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vendor</h2>
        <button
          onClick={() => setShowAddVendor(!showAddVendor)}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Tambah Vendor
        </button>
      </div>

      {showAddVendor && (
        <form onSubmit={addVendor} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Nama vendor"
            value={newVendor.name}
            onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Kontak"
            value={newVendor.contact}
            onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            type="number"
            placeholder="Total kontrak"
            value={newVendor.totalContract}
            onChange={(e) => setNewVendor({ ...newVendor, totalContract: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
            Simpan
          </button>
        </form>
      )}

      <div className="space-y-4">
        {vendors.map((vendor) => {
          const vendorPayments = getVendorPayments(vendor.id);
          return (
            <div key={vendor.id} className="rounded-lg border p-4">
              <div className="font-semibold">{vendor.name}</div>
              {vendor.contact && <div className="text-sm text-gray-600">{vendor.contact}</div>}
              {vendor.totalContract && (
                <div className="text-sm text-gray-600">
                  Kontrak: {vendor.totalContract.toLocaleString("id-ID")}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <h3 className="font-medium">Pembayaran</h3>
                <button
                  onClick={() => {
                    setSelectedVendor(vendor.id);
                    setShowAddPayment(!showAddPayment);
                  }}
                  className="text-sm rounded-md border px-3 py-1 hover:bg-gray-50"
                >
                  + Pembayaran
                </button>
              </div>

              {showAddPayment && selectedVendor === vendor.id && (
                <form onSubmit={addPayment} className="mt-2 grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input
                    type="hidden"
                    value={vendor.id}
                    onChange={(e) => setNewPayment({ ...newPayment, vendorId: e.target.value })}
                  />
                  <select
                    value={newPayment.type}
                    onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                    className="rounded-md border border-gray-300 px-2 py-1"
                  >
                    <option value="DP">DP</option>
                    <option value="CICILAN">Cicilan</option>
                    <option value="PELUNASAN">Pelunasan</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Jumlah"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    className="rounded-md border border-gray-300 px-2 py-1"
                    required
                  />
                  <input
                    type="date"
                    value={newPayment.dueDate}
                    onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                    className="rounded-md border border-gray-300 px-2 py-1"
                  />
                  <button type="submit" className="rounded-md bg-black px-3 py-1 text-white hover:bg-gray-800">
                    Simpan
                  </button>
                </form>
              )}

              <table className="w-full mt-4 text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="pb-2">Tipe</th>
                    <th className="pb-2">Jumlah</th>
                    <th className="pb-2">Jatuh Tempo</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorPayments.map((payment) => (
                    <tr key={payment.id} className="border-t">
                      <td className="py-2">{payment.type}</td>
                      <td className="py-2">{payment.amount.toLocaleString("id-ID")}</td>
                      <td className="py-2">
                        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            payment.status === "SUDAH_BAYAR"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status === "SUDAH_BAYAR" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </td>
                      <td className="py-2">
                        {payment.status === "BELUM_BAYAR" && (
                          <button
                            onClick={() => markAsPaid(payment.id)}
                            className="text-blue-600 hover:underline"
                          >
                            Tandai Lunas
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
