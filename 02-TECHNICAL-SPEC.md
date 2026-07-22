# Technical Specification — Wedding RAB Planner

## 1. Tech Stack

| Layer          | Pilihan                                                                       |
| -------------- | ----------------------------------------------------------------------------- |
| Framework      | Next.js 14+ (App Router)                                                      |
| Bahasa         | TypeScript                                                                    |
| ORM            | Prisma                                                                        |
| Database       | MySQL                                                                         |
| Auth           | NextAuth.js (Credentials Provider)                                            |
| Styling        | Tailwind CSS + shadcn/ui                                                      |
| PWA            | `@ducanh2912/next-pwa` (fork next-pwa yang aktif dimaintain untuk App Router) |
| Hosting        | VPS (self-managed) — Nginx (reverse proxy + SSL) + PM2 (process manager)      |
| Validasi input | Zod                                                                           |

## 2. Arsitektur Umum

Aplikasi full-stack dalam satu codebase Next.js:

- **Frontend (App Router pages):** Server Components untuk render awal, Client Components untuk interaktivitas (form, modal, dsb).
- **Backend (API Routes / Route Handlers):** `/app/api/**` menangani semua operasi data (CRUD), tervalidasi dengan Zod, terhubung ke MySQL via Prisma.
- **Auth layer:** NextAuth mengelola session (JWT strategy, disimpan di cookie httpOnly). Setiap Route Handler yang butuh data wedding memvalidasi session lalu memverifikasi keanggotaan user pada `wedding_id` terkait (tenant guard).
- **PWA layer:** Service worker digenerate saat build, meng-cache asset statis dan menerapkan cache-first/stale-while-revalidate untuk halaman yang sudah dikunjungi.

```
Client (Browser/PWA)
    |
    v
Next.js App Router (SSR + Client Components)
    |
    v
Route Handlers (/app/api/**)  --  Zod validation  --  Tenant Guard
    |
    v
Prisma Client
    |
    v
MySQL Database
```

## 3. Struktur Folder

```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(dashboard)
    /wedding/new/page.tsx                     -- buat wedding baru
    /wedding/[weddingId]/layout.tsx            -- guard: cek membership
    /wedding/[weddingId]/page.tsx              -- overview/dashboard ringkasan
    /wedding/[weddingId]/rab/page.tsx          -- kategori & budget items
    /wedding/[weddingId]/vendors/page.tsx      -- daftar vendor & payment
    /wedding/[weddingId]/checklist/page.tsx    -- task & timeline
    /wedding/[weddingId]/members/page.tsx      -- undang partner
  /api
    /auth/[...nextauth]/route.ts
    /auth/register/route.ts
    /wedding/route.ts                          -- POST create, GET list wedding milik user
    /wedding/[id]/route.ts                     -- GET detail, PATCH, DELETE
    /wedding/[id]/members/route.ts
    /wedding/[id]/categories/route.ts
    /wedding/[id]/categories/[categoryId]/route.ts
    /wedding/[id]/budget-items/route.ts
    /wedding/[id]/budget-items/[itemId]/route.ts
    /wedding/[id]/vendors/route.ts
    /wedding/[id]/vendors/[vendorId]/route.ts
    /wedding/[id]/payments/route.ts
    /wedding/[id]/payments/[paymentId]/route.ts
    /wedding/[id]/tasks/route.ts
    /wedding/[id]/tasks/[taskId]/route.ts
  layout.tsx
  manifest.ts (atau /public/manifest.json)
/components
  /ui/*                  -- komponen shadcn/ui hasil `npx shadcn add` (button, card, table, dsb)
  /wedding/*             -- komponen komposit khusus app (BudgetProgressBar, PaymentStatusBadge,
                            CategoryCard, TaskItem) — dibangun di atas /ui sesuai 06-DESIGN-SYSTEM.md
/lib
  /prisma.ts           -- singleton PrismaClient
  /auth.ts              -- NextAuth config (authOptions)
  /tenant-guard.ts       -- helper: assertWeddingMember(userId, weddingId)
  /validators/*.ts       -- skema Zod per resource
  /utils.ts              -- cn() helper (dari shadcn/ui)
/prisma
  /schema.prisma
  /migrations
/public
  /icons/*.png
  manifest.json
next.config.js           -- konfigurasi next-pwa
.env.example
```

## 4. Autentikasi & Tenant Isolation

- **Registrasi:** endpoint custom `/api/auth/register` — hash password dengan bcrypt sebelum simpan ke tabel `User`.
- **Login:** NextAuth Credentials Provider, verifikasi email + password hash, session strategy `jwt`.
- **Session payload:** minimal berisi `userId`, `email`, `name`.
- **Tenant Guard:** setiap Route Handler di bawah `/api/wedding/[id]/**` WAJIB memanggil helper `assertWeddingMember(userId, weddingId)` di awal — query ke tabel `WeddingMember`, kembalikan 403 jika user bukan member. Ini mencegah kebocoran data lintas-tenant.
- **Role sederhana:** `owner` (yang membuat wedding) dan `partner` (yang diundang). v1 tidak perlu permission granular — keduanya punya akses penuh baca/tulis ke data wedding tersebut.

## 5. PWA Configuration

- `next.config.js` dibungkus dengan `withPWA` dari `@ducanh2912/next-pwa`.
- **Viewport meta wajib** di `app/layout.tsx` (lihat `06-DESIGN-SYSTEM.md` §8) — `viewport-fit=cover` diperlukan agar `env(safe-area-inset-bottom)` pada `<BottomNav />` berfungsi di perangkat ber-notch.
- `public/manifest.json`: nama app, short_name, theme_color, background_color, icons (192x192, 512x512, termasuk maskable icon).
- Strategi caching:
  - Asset statis (JS/CSS/font): cache-first.
  - Halaman dashboard yang sudah dikunjungi (RAB, vendors, checklist): stale-while-revalidate, supaya tetap terbuka saat offline namun otomatis update saat online.
  - API calls: network-first dengan fallback ke cache terakhir + indikator "data mungkin tidak terbaru" di UI saat offline.
- Registrasi service worker otomatis oleh plugin saat `next build`.

## 6. Environment Variables (`.env.example`)

```
DATABASE_URL="mysql://user:password@localhost:3306/wedding_rab"
NEXTAUTH_SECRET="generate-dengan-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"
```

## 7. Deployment ke VPS

1. **Provisioning:** VPS dengan Node.js LTS, MySQL server, Nginx, PM2 terpasang.
2. **Database:** buat database & user MySQL khusus untuk app; jalankan `npx prisma migrate deploy` saat deploy.
3. **Build:** `npm run build` menghasilkan `.next` production build (service worker ikut ter-generate).
4. **Process manager:** jalankan dengan PM2 — `pm2 start npm --name wedding-rab -- start`, simpan konfigurasi dengan `pm2 save` agar auto-restart saat server reboot.
5. **Reverse proxy:** Nginx meneruskan request dari port 80/443 ke port Next.js (default 3000), menangani SSL via Certbot (Let's Encrypt).
6. **HTTPS wajib** — PWA (service worker) hanya berjalan penuh di atas HTTPS (kecuali localhost saat development).
7. **Env di server:** simpan `.env` di server (tidak masuk git), pastikan `DATABASE_URL` dan `NEXTAUTH_SECRET` sudah production-ready.

## 8. UI & Design System

Semua tampilan dibangun di atas **shadcn/ui** (komponen di-generate via CLI ke `/components/ui`, bukan dependency npm — jadi bebas dikustomisasi) dengan token warna/tipografi kustom bertema wedding (palet soft). Detail lengkap palet warna, font pairing, dan aturan styling per fitur ada di `06-DESIGN-SYSTEM.md` — dokumen itu jadi rujukan wajib setiap kali membangun/mengubah UI, supaya konsisten di semua halaman.

---

Dokumen terkait: `01-PRD.md`, `03-DATABASE-SCHEMA.md`, `04-API-SPEC.md`, `05-IMPLEMENTATION-PLAN.md`, `06-DESIGN-SYSTEM.md`
