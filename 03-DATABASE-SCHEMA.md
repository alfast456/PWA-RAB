# Database Schema — Wedding RAB Planner

## 1. Ringkasan Entitas

- **User** — akun pengguna (bisa jadi member dari 1+ Wedding).
- **Wedding** — tenant boundary; satu event pernikahan.
- **WeddingMember** — relasi many-to-many User↔Wedding, menyimpan role.
- **Category** — kategori anggaran dalam satu Wedding (Venue, Katering, dll).
- **BudgetItem** — item RAB di dalam kategori (budget vs actual).
- **Vendor** — vendor yang terkait ke Wedding (opsional terkait ke Category).
- **Payment** — pembayaran ke Vendor (DP/cicilan/pelunasan) dengan status & jatuh tempo.
- **Task** — checklist/timeline persiapan pernikahan.

## 2. Relasi Utama

```
User ─┬──< WeddingMember >──┬─ Wedding
      │                     │
      │                     ├──< Category ──< BudgetItem
      │                     ├──< Vendor ──< Payment
      │                     └──< Task
```

Semua tabel turunan (`Category`, `Vendor`, `Payment`, `Task`, `BudgetItem`) selalu ter-scope langsung atau tidak langsung ke `wedding_id` — ini kunci isolasi multi-tenant.

## 3. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(cuid())
  email         String          @unique
  passwordHash  String
  name          String
  createdAt     DateTime        @default(now())
  weddings      WeddingMember[]
  tasksAssigned Task[]          @relation("TaskAssignee")
}

model Wedding {
  id           String          @id @default(cuid())
  name         String
  weddingDate  DateTime?
  createdAt    DateTime        @default(now())
  members      WeddingMember[]
  categories   Category[]
  vendors      Vendor[]
  tasks        Task[]
}

enum MemberRole {
  OWNER
  PARTNER
}

model WeddingMember {
  id        String      @id @default(cuid())
  weddingId String
  userId    String
  role      MemberRole  @default(PARTNER)
  joinedAt  DateTime    @default(now())

  wedding   Wedding     @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([weddingId, userId])
  @@index([userId])
}

model Category {
  id          String       @id @default(cuid())
  weddingId   String
  name        String
  createdAt   DateTime     @default(now())

  wedding     Wedding      @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  budgetItems BudgetItem[]
  vendors     Vendor[]

  @@index([weddingId])
}

model BudgetItem {
  id            String    @id @default(cuid())
  categoryId    String
  name          String
  budgetAmount  Decimal   @db.Decimal(14, 2)
  actualAmount  Decimal   @default(0) @db.Decimal(14, 2)
  notes         String?   @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  category      Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
}

model Vendor {
  id             String     @id @default(cuid())
  weddingId      String
  categoryId     String?
  name           String
  contact        String?
  totalContract  Decimal?   @db.Decimal(14, 2)
  createdAt      DateTime   @default(now())

  wedding        Wedding    @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  category       Category?  @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  payments       Payment[]

  @@index([weddingId])
  @@index([categoryId])
}

enum PaymentType {
  DP
  CICILAN
  PELUNASAN
}

enum PaymentStatus {
  BELUM_BAYAR
  SUDAH_BAYAR
}

model Payment {
  id          String        @id @default(cuid())
  vendorId    String
  type        PaymentType
  amount      Decimal       @db.Decimal(14, 2)
  dueDate     DateTime?
  paidAt      DateTime?
  status      PaymentStatus @default(BELUM_BAYAR)
  createdAt   DateTime      @default(now())

  vendor      Vendor        @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@index([dueDate])
}

enum TaskStatus {
  BELUM
  SEDANG_BERJALAN
  SELESAI
}

model Task {
  id           String      @id @default(cuid())
  weddingId    String
  title        String
  dueDate      DateTime?
  status       TaskStatus  @default(BELUM)
  assignedToId String?
  createdAt    DateTime    @default(now())

  wedding      Wedding     @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  assignedTo   User?       @relation("TaskAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)

  @@index([weddingId])
  @@index([dueDate])
}
```

## 4. Catatan Desain

- **Cascade delete:** menghapus `Wedding` otomatis menghapus semua `Category`, `Vendor`, `Task` (dan turunannya `BudgetItem`, `Payment`) — mencegah data yatim.
- **Decimal untuk uang:** semua nominal pakai `Decimal(14,2)`, bukan `Float`, untuk menghindari floating-point error pada perhitungan anggaran.
- **Index `dueDate`:** mempercepat query "upcoming payments" dan "task mendekati deadline".
- **`categoryId` nullable di Vendor:** vendor boleh belum terkait kategori tertentu (misal vendor lain-lain).
- **Perhitungan ringkasan (total budget vs actual)** sebaiknya dilakukan via query aggregate (`SUM`) di level API/service, bukan disimpan sebagai kolom ter-denormalisasi, supaya selalu akurat.

---
Dokumen terkait: `01-PRD.md`, `02-TECHNICAL-SPEC.md`, `04-API-SPEC.md`, `05-IMPLEMENTATION-PLAN.md`
