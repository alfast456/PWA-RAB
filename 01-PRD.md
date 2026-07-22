# PRD — Wedding RAB Planner (PWA)

## 1. Ringkasan Produk

**Nama produk:** Wedding RAB Planner
**Jenis:** Progressive Web App (PWA), multi-tenant
**Tujuan:** Membantu pasangan calon pengantin merencanakan, mencatat, dan memantau anggaran biaya pernikahan (RAB), pembayaran vendor, serta checklist & timeline persiapan — dalam satu aplikasi yang bisa diakses seperti aplikasi native (installable, bisa dibuka meski koneksi lemah).

## 2. Masalah yang Diselesaikan

- Pasangan sering mencatat RAB pernikahan di spreadsheet terpisah yang tidak sinkron antara kedua calon pengantin.
- Tracking DP/pelunasan ke banyak vendor sulit dipantau — sering lupa jatuh tempo pembayaran.
- Tidak ada gambaran cepat "budget vs realisasi" per kategori (venue, katering, dekorasi, dll).
- Checklist & timeline persiapan tercecer di berbagai tempat (notes HP, chat WA, dsb).

## 3. Target Pengguna

- **Primary persona:** Pasangan calon pengantin (2 user per wedding) yang sedang mempersiapkan pernikahan dan ingin kolaborasi mencatat anggaran bersama.
- **Karakteristik:** Familiar dengan aplikasi mobile, sering mengakses dari HP saat bertemu vendor, butuh akses cepat meski sinyal tidak stabil (PWA + offline-first).

## 4. Tujuan Produk (Goals)

1. Satu sumber kebenaran (single source of truth) untuk RAB pernikahan yang bisa diakses bersama pasangan.
2. Visibilitas real-time: budget vs actual per kategori, sisa anggaran total.
3. Tracking pembayaran vendor (DP, cicilan, pelunasan) beserta jatuh temponya.
4. Checklist & timeline tugas persiapan pernikahan.
5. Bisa di-install sebagai aplikasi (PWA) dan tetap bisa dibuka dalam kondisi offline/koneksi buruk untuk data yang sudah pernah dimuat.
6. Mendukung multi-tenant: banyak pasangan bisa pakai aplikasi yang sama secara terisolasi (data pasangan A tidak terlihat oleh pasangan B).

## 5. Non-Goals (Di Luar Cakupan v1)

- Tidak ada marketplace/direct booking vendor (vendor hanya dicatat manual oleh user).
- Tidak ada payment gateway terintegrasi (pencatatan pembayaran manual, bukan transaksi real).
- Tidak ada fitur undangan digital / RSVP tamu (fokus v1 hanya RAB, vendor-payment, checklist).
- Tidak ada aplikasi native (PWA saja untuk v1).

## 6. Fitur Utama & User Stories

### 6.1 Autentikasi & Multi-tenant (Wedding Workspace)
- Sebagai pengguna baru, saya bisa mendaftar (email + password) dan login.
- Sebagai pengguna, saya bisa membuat "Wedding" baru (nama acara, tanggal pernikahan) — ini menjadi workspace/tenant saya.
- Sebagai owner Wedding, saya bisa mengundang pasangan (partner) untuk join ke Wedding yang sama via email, sehingga keduanya melihat data yang sama.
- Sebagai user, saya hanya bisa mengakses data Wedding di mana saya menjadi member — tidak bisa melihat data Wedding lain.

### 6.2 RAB (Budget) per Kategori
- Sebagai user, saya bisa membuat kategori anggaran (misal: Venue, Katering, Dekorasi, Fotografi, Baju, Souvenir, Lain-lain).
- Sebagai user, saya bisa menambahkan item budget di dalam kategori, dengan nominal rencana (budget) dan nominal realisasi (actual).
- Sebagai user, saya bisa melihat ringkasan: total budget, total actual, sisa/selisih — baik per kategori maupun keseluruhan.
- Sebagai user, saya melihat indikator visual (misal warna) jika actual melebihi budget pada suatu kategori.

### 6.3 Vendor & Tracking Pembayaran
- Sebagai user, saya bisa mencatat vendor (nama, kontak, kategori terkait, total nilai kontrak).
- Sebagai user, saya bisa mencatat rencana pembayaran ke vendor (DP, cicilan, pelunasan) lengkap dengan jumlah dan tanggal jatuh tempo.
- Sebagai user, saya bisa menandai suatu pembayaran sebagai "sudah dibayar" beserta tanggal pembayaran aktual.
- Sebagai user, saya bisa melihat daftar pembayaran yang akan jatuh tempo (upcoming payments) agar tidak terlewat.

### 6.4 Checklist & Timeline Persiapan
- Sebagai user, saya bisa membuat task/tugas persiapan pernikahan dengan judul, deadline, dan status (belum/sedang/selesai).
- Sebagai user, saya bisa menandai siapa (partner mana) yang bertanggung jawab atas suatu task.
- Sebagai user, saya bisa melihat task diurutkan berdasarkan deadline terdekat.

### 6.5 PWA & Offline
- Sebagai user, saya bisa "install" aplikasi ini ke home screen HP saya.
- Sebagai user, halaman yang sudah pernah saya buka (RAB, vendor, checklist) tetap bisa saya lihat walau sedang offline.
- Sebagai user, saya mendapat indikasi jelas jika sedang offline dan perubahan belum tersimpan ke server.

## 7. Requirement Non-Fungsional

- **Isolasi data (tenant safety):** Setiap query API wajib divalidasi bahwa user adalah member dari `wedding_id` yang diakses.
- **Keamanan:** Password di-hash (bcrypt/argon2), session via NextAuth, HTTPS wajib di production.
- **Performa:** First load < 3 detik pada koneksi 4G biasa; halaman inti (RAB) harus cepat karena paling sering dibuka.
- **PWA compliance:** Lolos kriteria installable PWA (manifest valid, service worker terdaftar, HTTPS).
- **Skalabilitas ringan:** Desain database harus siap untuk ratusan-ribuan wedding tenant tanpa perubahan skema besar.

## 8. Metrik Keberhasilan (v1)

- User bisa menyelesaikan alur "daftar → buat wedding → tambah kategori & budget item" tanpa bantuan, dalam < 5 menit.
- Aplikasi lolos Lighthouse PWA audit (installable, offline-capable) dengan skor PWA di atas 90.
- Tidak ada kebocoran data lintas-tenant (diverifikasi via testing: user A tidak bisa akses data wedding milik user B meski tahu ID-nya).

## 9. Rilis & Skalabilitas Fitur (Roadmap Singkat)

- **v1 (MVP):** Auth, Wedding workspace, RAB kategori & budget item, Vendor & payment tracking, Checklist, PWA offline dasar.
- **v2 (kemungkinan lanjutan):** Export RAB ke PDF/Excel, notifikasi push untuk jatuh tempo pembayaran, kolaborasi lebih dari 2 member per wedding.

---
Dokumen terkait: `02-TECHNICAL-SPEC.md`, `03-DATABASE-SCHEMA.md`, `04-API-SPEC.md`, `05-IMPLEMENTATION-PLAN.md`
