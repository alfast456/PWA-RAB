# Implementation Plan — Wedding RAB Planner

Dokumen ini dirancang untuk dieksekusi bertahap menggunakan AI coding agent (misal Claude Code). Setiap fase punya scope kecil dan acceptance criteria jelas — kerjakan satu fase penuh, verifikasi, baru lanjut ke fase berikutnya. Jangan minta AI mengerjakan semua fase sekaligus dalam satu prompt besar; hasilnya lebih terkontrol jika dicicil.

**Cara pakai:** di awal setiap fase, berikan ke AI agent: dokumen `01-PRD.md`, `02-TECHNICAL-SPEC.md`, `03-DATABASE-SCHEMA.md`, `04-API-SPEC.md` sebagai konteks, lalu minta AI mengerjakan fase yang sesuai. Untuk fase apa pun yang menyentuh UI (Fase 0.5 dan seterusnya), sertakan juga `06-DESIGN-SYSTEM.md` — semua tampilan wajib mengikuti token warna, tipografi, dan pemetaan komponen shadcn/ui di dokumen tersebut, bukan styling default/tebakan AI sendiri.

## Fase 0 — Project Setup

- [ ] Init project: `npx create-next-app@latest` (TypeScript, App Router, Tailwind).
- [ ] Install dependencies: `prisma`, `@prisma/client`, `next-auth`, `@ducanh2912/next-pwa`, `zod`, `bcryptjs`.
- [ ] Setup `prisma/schema.prisma` sesuai `03-DATABASE-SCHEMA.md`, jalankan `npx prisma migrate dev --name init`.
- [ ] Buat `.env.example` dan `.env` lokal (lihat `02-TECHNICAL-SPEC.md` §6).
- [ ] Setup `lib/prisma.ts` (singleton client, hindari multiple instance saat dev hot-reload).

**Acceptance:** `npm run dev` jalan tanpa error, `npx prisma studio` bisa membuka database kosong dengan tabel sesuai schema.

## Fase 0.5 — Design System & shadcn/ui Setup

- [ ] Init shadcn/ui: `npx shadcn@latest init` (base color: neutral, lalu timpa dengan token kustom).
- [ ] Ganti isi `app/globals.css` dengan CSS variables dari `06-DESIGN-SYSTEM.md` §1.
- [ ] Setup font `Bodoni Moda` + `Inter` via `next/font/google` di `app/layout.tsx`, daftarkan ke `tailwind.config` (`fontFamily.display`, `fontFamily.sans`).
- [ ] Set `--radius: 0.75rem` dan pastikan konsisten di semua komponen dasar.
- [ ] Install komponen shadcn dasar yang dipakai lintas halaman: `button`, `card`, `input`, `label`, `badge`, `separator`, `sheet`, `alert-dialog`, `dropdown-menu`, `sonner`, `form`. (`dialog` tengah tidak dipakai untuk form utama — diganti `sheet` bottom drawer, sesuai pola mobile-first di §7)
- [ ] Install `lucide-react` untuk ikon (dipasangkan selalu dengan label teks, tidak ada ikon tanpa teks).
- [ ] Bangun komponen komposit di `/components/wedding`: `<LedgerRow />` (baris nama+nominal sejajar), `<SectionHeading />` (judul + hairline rule emas sesuai §4), `<StatusBadge />` (varian aman/over/lunas/jatuh-tempo/overdue sesuai §5), `<BottomNav />` (tab bar fixed bawah, ikon+label, sesuai §7.1), `<StickyActionBar />` (wrapper tombol sticky bawah untuk Sheet/halaman, sesuai §7.2).
- [ ] Buat 1 halaman contoh (misal `/design-preview`, boleh dihapus nanti) yang menampilkan semua komponen di atas — termasuk `<BottomNav />` fixed di bawah dan contoh `<StickyActionBar />` di dalam `Sheet` — untuk quick visual check sebelum dipakai di halaman sungguhan.

**Acceptance:** Halaman preview menampilkan warna, font, dan komponen sesuai `06-DESIGN-SYSTEM.md` — termasuk bottom tab bar yang tetap terlihat saat scroll dan tombol sticky yang tidak tertutup keyboard/safe-area di HP — dicek manual oleh kamu sebelum lanjut ke fase berikutnya, karena ini jadi fondasi visual seluruh app.

## Fase 1 — Auth & Wedding Workspace

- [ ] Implementasi `/api/auth/register` (hash password, validasi Zod).
- [ ] Setup NextAuth (`lib/auth.ts`) dengan Credentials provider.
- [ ] Halaman `/login` dan `/register` — pakai `Card`, `Form`, `Input`, `Button` dari shadcn/ui sesuai `06-DESIGN-SYSTEM.md`.
- [ ] Implementasi `lib/tenant-guard.ts` — fungsi `assertWeddingMember(userId, weddingId)`.
- [ ] Endpoint `POST/GET /api/wedding` (create & list).
- [ ] Endpoint `POST/GET /api/wedding/:id/members` (undang partner).
- [ ] Halaman `/wedding/new` (form buat wedding) dan `/wedding/[weddingId]/members` (kelola member).

**Acceptance:** User A register → login → buat Wedding X. User B register → login → tidak bisa akses `/api/wedding/X` (403) sampai diundang oleh User A. Setelah diundang, User B bisa akses data Wedding X yang sama.

## Fase 2 — RAB Core (Kategori & Budget Item)

- [ ] Endpoint CRUD `/api/wedding/:id/categories`.
- [ ] Endpoint CRUD `/api/wedding/:id/budget-items`.
- [ ] Halaman `/wedding/[weddingId]/rab` — tiap kategori pakai `<SectionHeading />` (hairline rule), budget item ditampilkan sebagai `<LedgerRow />`; form tambah/edit pakai `Sheet` (bottom drawer) dengan `<StickyActionBar />` berisi tombol "Simpan" (ikon+teks) menempel di bawah.
- [ ] Tampilkan ringkasan total budget vs actual per kategori dan keseluruhan (nominal besar pakai style §2 — `font-display tabular-nums`).
- [ ] Indikator visual pakai `<StatusBadge variant="aman|over" />` jika actual > budget pada suatu kategori (lihat `06-DESIGN-SYSTEM.md` §5).

**Acceptance:** User bisa membuat kategori, menambahkan beberapa budget item, dan melihat total budget/actual ter-update otomatis. Data hanya terlihat oleh member wedding tersebut.

## Fase 3 — Vendor & Payment Tracking

- [ ] Endpoint CRUD `/api/wedding/:id/vendors`.
- [ ] Endpoint CRUD `/api/wedding/:id/payments`, termasuk filter `upcoming=true`.
- [ ] Halaman `/wedding/[weddingId]/vendors` — vendor ditampilkan sebagai `Card`, riwayat pembayaran pakai `<LedgerRow />` + `<StatusBadge variant="lunas|jatuh-tempo|overdue" />`, date picker jatuh tempo pakai `Calendar` + `Popover`, form tambah vendor/pembayaran pakai `Sheet` dengan `<StickyActionBar />`, tombol "tandai lunas" (ikon `CheckCircle` + teks).
- [ ] Widget "Pembayaran Mendatang" (dari endpoint `upcoming=true`) ditampilkan di dashboard utama sebagai `Card` ringkas dengan `<StatusBadge />` per baris.

**Acceptance:** User bisa mencatat vendor, menambahkan rencana DP/cicilan/pelunasan dengan jatuh tempo, menandai lunas, dan melihat daftar pembayaran yang akan datang terurut dari yang paling dekat.

## Fase 4 — Checklist & Timeline

- [ ] Endpoint CRUD `/api/wedding/:id/tasks`.
- [ ] Halaman `/wedding/[weddingId]/checklist` — list task terurut deadline pakai `Checkbox` + `<StatusBadge />`, filter status pakai `Tabs`, assign member pakai `Select`.
- [ ] Progress bar (jumlah task selesai/total) pakai `Progress` shadcn yang dikustom tipis, warna `secondary` sesuai `06-DESIGN-SYSTEM.md` §5.

**Acceptance:** User bisa membuat task, assign ke salah satu member wedding, ubah status, dan melihat progress keseluruhan.

## Fase 5 — Dashboard Ringkasan

- [ ] Endpoint `GET /api/wedding/:id/summary` (agregasi budget, upcoming payments, task progress).
- [ ] Halaman `/wedding/[weddingId]` sebagai landing dashboard: `Card` ringkasan total budget/actual/sisa (nominal `font-display tabular-nums`), list pembayaran mendatang, progress checklist — stack 1 kolom di mobile dengan `<BottomNav />` di bawah, opsional grid lebih lebar di desktop sesuai `06-DESIGN-SYSTEM.md` §7.

**Acceptance:** Membuka halaman utama wedding langsung memberi gambaran lengkap kondisi persiapan tanpa perlu buka halaman lain.

## Fase 6 — PWA

- [ ] Setup `@ducanh2912/next-pwa` di `next.config.js`.
- [ ] Buat `public/manifest.json` + icon set (192x192, 512x512, maskable).
- [ ] Definisikan caching strategy sesuai `02-TECHNICAL-SPEC.md` §5.
- [ ] Tambahkan indikator UI "offline mode" saat `navigator.onLine === false`.
- [ ] Test lolos Lighthouse PWA audit (installable + offline capable).

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

## Catatan Perbaikan — Audit Mobile-First (untuk halaman yang sudah terlanjur dibangun)

Kalau beberapa halaman sudah dibangun sebelum `06-DESIGN-SYSTEM.md` diperbarui (§3.1 breakpoint, §7.2 konfigurasi Sheet), cek & perbaiki hal-hal ini per halaman — ini penyebab paling umum tampilan terasa "kaku"/belum responsive:

- [ ] **Cek semua `<Sheet>`:** pastikan ada `side="bottom"` eksplisit + `className="max-h-[85vh] rounded-t-2xl"`. Jika prop ini hilang, Sheet default slide dari kanan seperti drawer sempit, bukan bottom sheet.
- [ ] **Cek halaman RAB:** pastikan di lebar < 768px yang dirender adalah `<LedgerRow>`/`Card`, bukan `<Table>` yang menyebabkan scroll horizontal.
- [ ] **Cek ukuran tombol/checkbox:** ganti `size="sm"` ke minimal `size="default"`/`lg` dengan `h-11` untuk aksi utama di mobile.
- [ ] **Cek `app/layout.tsx`:** pastikan meta viewport punya `viewport-fit=cover`, dan `<BottomNav />` diberi `padding-bottom: env(safe-area-inset-bottom)`.
- [ ] **Cek padding halaman:** ganti padding tetap (misal `p-8` di semua ukuran) jadi responsive (`px-4 md:px-6 lg:px-8`) sesuai §3.1.
- [ ] **Cek elemen yang overflow:** nama kategori/vendor panjang atau badge status — pastikan `truncate` atau `flex-wrap`, test dengan teks terpanjang yang mungkin muncul.

---

Dokumen terkait: `01-PRD.md`, `02-TECHNICAL-SPEC.md`, `03-DATABASE-SCHEMA.md`, `04-API-SPEC.md`, `06-DESIGN-SYSTEM.md`
