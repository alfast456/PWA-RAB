# Implementation Plan — Wedding RAB Planner

Dokumen ini dirancang untuk dieksekusi bertahap menggunakan AI coding agent (misal Claude Code). Setiap fase punya scope kecil dan acceptance criteria jelas — kerjakan satu fase penuh, verifikasi, baru lanjut ke fase berikutnya. Jangan minta AI mengerjakan semua fase sekaligus dalam satu prompt besar; hasilnya lebih terkontrol jika dicicil.

**Cara pakai:** di awal setiap fase, berikan ke AI agent: dokumen `01-PRD.md`, `02-TECHNICAL-SPEC.md`, `03-DATABASE-SCHEMA.md`, `04-API-SPEC.md` sebagai konteks, lalu minta AI mengerjakan fase yang sesuai.

## Fase 0 — Project Setup

- [x] Init project: `npx create-next-app@latest` (TypeScript, App Router, Tailwind).
- [x] Install dependencies: `prisma`, `@prisma/client`, `next-auth`, `@ducanh2912/next-pwa`, `zod`, `bcryptjs`.
- [x] Setup `prisma/schema.prisma` sesuai `03-DATABASE-SCHEMA.md`, jalankan `npx prisma migrate dev --name init`.
- [x] Buat `.env.example` dan `.env` lokal (lihat `02-TECHNICAL-SPEC.md §6`).
- [x] Setup `lib/prisma.ts` (singleton client, hindari multiple instance saat dev hot-reload).

**Acceptance:** `npm run dev` jalan tanpa error, `npx prisma studio` bisa membuka database kosong dengan tabel sesuai schema.

## Fase 1 — Auth & Wedding Workspace

- [x] Implementasi `/api/auth/register` (hash password, validasi Zod).
- [x] Setup NextAuth (`lib/auth.ts`) dengan Credentials provider.
- [x] Halaman `/login` dan `/register`.
- [x] Implementasi `lib/tenant-guard.ts` — fungsi `assertWeddingMember(userId, weddingId)`.
- [x] Endpoint `POST/GET /api/wedding` (create & list).
- [x] Endpoint `POST/GET /api/wedding/:id/members` (undang partner).
- [x] Halaman `/wedding/new` (form buat wedding) dan `/wedding/[weddingId]/members` (kelola member).

**Acceptance:** User A register → login → buat Wedding X. User B register → login → tidak bisa akses `/api/wedding/X` (403) sampai diundang oleh User A. Setelah diundang, User B bisa akses data Wedding X yang sama.

## Fase 2 — RAB Core (Kategori & Budget Item)

- [x] Endpoint CRUD `/api/wedding/:id/categories`.
- [x] Endpoint CRUD `/api/wedding/:id/budget-items`.
- [x] Halaman `/wedding/[weddingId]/rab` — tabel kategori, expand untuk lihat budget items, form tambah/edit.
- [x] Tampilkan ringkasan total budget vs actual per kategori dan keseluruhan.
- [x] Indikator visual (misal warna merah) jika actual > budget pada suatu kategori.

**Acceptance:** User bisa membuat kategori, menambahkan beberapa budget item, dan melihat total budget/actual ter-update otomatis. Data hanya terlihat oleh member wedding tersebut.

## Fase 3 — Vendor & Payment Tracking

- [x] Endpoint CRUD `/api/wedding/:id/vendors`.
- [x] Endpoint CRUD `/api/wedding/:id/payments`, termasuk filter `upcoming=true`.
- [x] Halaman `/wedding/[weddingId]/vendors` — list vendor, detail pembayaran per vendor, form tambah pembayaran, tombol "tandai lunas".
- [x] Widget "Pembayaran Mendatang" (dari endpoint `upcoming=true`) ditampilkan di dashboard utama.

**Acceptance:** User bisa mencatat vendor, menambahkan rencana DP/cicilan/pelunasan dengan jatuh tempo, menandai lunas, dan melihat daftar pembayaran yang akan datang terurut dari yang paling dekat.

## Fase 4 — Checklist & Timeline

- [x] Endpoint CRUD `/api/wedding/:id/tasks`.
- [x] Halaman `/wedding/[weddingId]/checklist` — list task terurut deadline, filter by status, assign ke member.
- [x] Progress bar sederhana (jumlah task selesai / total).

**Acceptance:** User bisa membuat task, assign ke salah satu member wedding, ubah status, dan melihat progress keseluruhan.

## Fase 5 — Dashboard Ringkasan

- [x] Endpoint `GET /api/wedding/:id/summary` (agregasi budget, upcoming payments, task progress).
- [x] Halaman `/wedding/[weddingId]` sebagai landing dashboard: kartu ringkasan total budget/actual/sisa, list pembayaran mendatang, progress checklist.

**Acceptance:** Membuka halaman utama wedding langsung memberi gambaran lengkap kondisi persiapan tanpa perlu buka halaman lain.

## Fase 6 — PWA

- [x] Setup `@ducanh2912/next-pwa` di `next.config.js`.
- [x] Buat `public/manifest.json` + icon set (192x192, 512x512, maskable).
- [x] Definisikan caching strategy sesuai `02-TECHNICAL-SPEC.md §5`.
- [x] Tambahkan indikasi UI "offline mode" saat `navigator.onLine === false`.
- [x] Test lolos Lighthouse PWA audit (installable + offline capable).

**Acceptance:** Aplikasi bisa di-"Add to Home Screen" di mobile, dan halaman RAB yang sudah pernah dibuka tetap tampil saat HP dalam mode pesawat.

## Fase 7 — Deployment ke VPS

- [ ] Provisioning VPS: Node.js LTS, MySQL, Nginx, PM2.
- [ ] Setup database production, jalankan `npx prisma migrate deploy`.
- [ ] Build & jalankan via PM2, konfigurasi Nginx reverse proxy + SSL (Certbot).
- [ ] Verifikasi HTTPS aktif dan service worker terdaftar di production.

**Acceptance:** Aplikasi bisa diakses via domain HTTPS, PWA installable dari domain production, login/register/CRUD berjalan normal.

---

## Catatan untuk Eksekusi via AI Agent

- Selalu sertakan `03-DATABASE-SCHEMA.md` dan `04-API-SPEC.md` sebagai referensi setiap kali meminta AI membuat/mengubah endpoint, agar konsisten dengan kontrak data yang sudah ditentukan.
- Setelah tiap fase selesai, minta AI menulis singkat apa yang berubah (file yang ditambah/diubah) sebelum lanjut fase berikutnya — memudahkan review.
- Tenant guard (`assertWeddingMember`) adalah bagian paling kritikal secara keamanan — selalu review manual bagian ini, jangan hanya percaya output AI begitu saja.

---
Dokumen terkait: `01-PRD.md`, `02-TECHNICAL-SPEC.md`, `03-DATABASE-SCHEMA.md`, `04-API-SPEC.md`
