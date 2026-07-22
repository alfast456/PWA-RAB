# API Specification — Wedding RAB Planner

Base path: `/api`
Semua endpoint (kecuali auth) membutuhkan session NextAuth aktif (cookie). Endpoint di bawah `/wedding/[id]/**` wajib lolos tenant guard (`assertWeddingMember`).

Format error standar:
```json
{ "error": { "code": "STRING_CODE", "message": "Pesan untuk user" } }
```
Kode umum: `UNAUTHORIZED` (401), `FORBIDDEN` (403 — bukan member wedding ini), `NOT_FOUND` (404), `VALIDATION_ERROR` (400).

## 1. Auth

### POST `/api/auth/register`
Body: `{ email, password, name }`
Response 201: `{ id, email, name }`
Validasi: email unik, password min 8 karakter.

### NextAuth routes
`/api/auth/[...nextauth]` — signin/signout/session ditangani otomatis oleh NextAuth (Credentials provider memanggil verifikasi email+password ke tabel `User`).

## 2. Wedding

### POST `/api/wedding`
Buat wedding baru; user pembuat otomatis jadi member dengan role `OWNER`.
Body: `{ name, weddingDate? }`
Response 201: object Wedding.

### GET `/api/wedding`
List semua wedding di mana user login menjadi member.
Response 200: `Wedding[]`

### GET `/api/wedding/:id`
Detail wedding (termasuk ringkasan total budget/actual). Tenant guard aktif.

### PATCH `/api/wedding/:id`
Update nama/tanggal wedding. Hanya member (owner/partner) yang bisa update.

### DELETE `/api/wedding/:id`
Hanya `OWNER` yang boleh menghapus wedding (cascade ke semua data terkait).

## 3. Members

### POST `/api/wedding/:id/members`
Undang partner via email (jika user dengan email tsb sudah terdaftar, langsung ditambahkan sebagai member role `PARTNER`; jika belum, kembalikan instruksi agar user tsb mendaftar dulu).
Body: `{ email }`

### GET `/api/wedding/:id/members`
List member wedding tersebut.

## 4. Categories

### GET `/api/wedding/:id/categories`
List kategori beserta agregat `totalBudget`, `totalActual` per kategori.

### POST `/api/wedding/:id/categories`
Body: `{ name }`

### PATCH `/api/wedding/:id/categories/:categoryId`
Body: `{ name }`

### DELETE `/api/wedding/:id/categories/:categoryId`
Cascade menghapus budget items di dalamnya — sebaiknya minta konfirmasi di frontend.

## 5. Budget Items

### GET `/api/wedding/:id/budget-items?categoryId=`
List budget item (bisa difilter per kategori).

### POST `/api/wedding/:id/budget-items`
Body: `{ categoryId, name, budgetAmount, actualAmount?, notes? }`

### PATCH `/api/wedding/:id/budget-items/:itemId`
Body: partial dari field di atas.

### DELETE `/api/wedding/:id/budget-items/:itemId`

## 6. Vendors

### GET `/api/wedding/:id/vendors`
List vendor beserta total pembayaran yang sudah/belum dibayar per vendor.

### POST `/api/wedding/:id/vendors`
Body: `{ name, categoryId?, contact?, totalContract? }`

### PATCH `/api/wedding/:id/vendors/:vendorId`

### DELETE `/api/wedding/:id/vendors/:vendorId`

## 7. Payments

### GET `/api/wedding/:id/payments?vendorId=&status=&upcoming=true`
List pembayaran; parameter `upcoming=true` mengembalikan pembayaran dengan `dueDate` dalam N hari ke depan dan status `BELUM_BAYAR`, diurutkan berdasarkan `dueDate` terdekat.

### POST `/api/wedding/:id/payments`
Body: `{ vendorId, type, amount, dueDate? }`

### PATCH `/api/wedding/:id/payments/:paymentId`
Dipakai juga untuk menandai lunas: `{ status: "SUDAH_BAYAR", paidAt: "<date>" }`.

### DELETE `/api/wedding/:id/payments/:paymentId`

## 8. Tasks

### GET `/api/wedding/:id/tasks?status=&sort=dueDate`
List task, default diurutkan berdasarkan `dueDate` terdekat.

### POST `/api/wedding/:id/tasks`
Body: `{ title, dueDate?, assignedToId? }`

### PATCH `/api/wedding/:id/tasks/:taskId`
Body: partial, termasuk update `status`.

### DELETE `/api/wedding/:id/tasks/:taskId`

## 9. Ringkasan/Dashboard

### GET `/api/wedding/:id/summary`
Response contoh:
```json
{
  "totalBudget": 150000000,
  "totalActual": 87500000,
  "remaining": 62500000,
  "categoriesOverBudget": ["Dekorasi"],
  "upcomingPayments": [ { "vendorName": "...", "amount": 5000000, "dueDate": "..." } ],
  "taskProgress": { "total": 20, "selesai": 8 }
}
```
Endpoint ini menggabungkan beberapa aggregate query (Prisma `groupBy`/`sum`) untuk menyuplai halaman dashboard utama.

---
Dokumen terkait: `01-PRD.md`, `02-TECHNICAL-SPEC.md`, `03-DATABASE-SCHEMA.md`, `05-IMPLEMENTATION-PLAN.md`
