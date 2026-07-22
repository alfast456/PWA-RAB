# Design System — Wedding RAB Planner

## 0. Arah Desain

Aplikasi ini duduk di persimpangan dua dunia: **undangan pernikahan** (lembut, elegan, personal) dan **buku besar keuangan** (rapi, presisi, bisa dipercaya angkanya). Alih-alih memilih salah satu — misalnya jadi dashboard admin generik yang dicat pink, atau jadi terlalu dekoratif sampai angkanya susah dibaca — arah desainnya adalah **"Invitation Ledger"**: tipografi & warna terasa seperti kartu undangan, tapi struktur data (tabel RAB, status pembayaran) tetap presisi seperti pembukuan.

**Signature element:** garis tipis emas pudar (hairline rule) di bawah setiap judul kategori/section — meniru garis pembatas pada kartu undangan — dan nominal uang selalu ditulis dengan angka tabular pada typeface display, sehingga kolom Rupiah selalu rapi sejajar seperti daftar mahar pada kartu undangan formal.

Palet sengaja dijaga **lembut dan minim kontras** (bukan pink cerah + emas mengkilap ala template Canva), karena ini dipakai harian untuk mengelola uang — harus tetap tenang dan mudah dibaca dalam waktu lama, bukan meriah.

## 1. Palet Warna

| Token                | Nama               | HSL (shadcn CSS var) | Hex (referensi) | Pemakaian                                     |
| -------------------- | ------------------ | -------------------- | --------------- | --------------------------------------------- |
| `background`         | Blush Ivory        | `16 45% 97%`         | ~#FBF4F1        | Latar utama app                               |
| `foreground`         | Ink Plum           | `340 15% 20%`        | ~#362E31        | Teks utama                                    |
| `primary`            | Dusty Rose         | `347 35% 62%`        | ~#C98A9A        | Tombol utama, link aktif, highlight           |
| `primary-foreground` | —                  | `0 0% 100%`          | #FFFFFF         | Teks di atas primary                          |
| `secondary`          | Sage               | `95 15% 58%`         | ~#93A587        | Status "on track", badge selesai              |
| `accent`             | Antique Gold       | `38 45% 55%`         | ~#C79A4B        | Hairline rule signature, aksen jarang dipakai |
| `destructive`        | Muted Brick        | `6 45% 55%`          | ~#C96F5E        | Over-budget, overdue payment                  |
| `muted`              | Warm Sand          | `20 25% 93%`         | ~#F1E7E1        | Background card sekunder, hover state         |
| `border`             | Warm Sand Line     | `20 20% 88%`         | ~#E4D7CF        | Border tipis, divider                         |
| `ring`               | Dusty Rose (focus) | `347 35% 62%`        | ~#C98A9A        | Focus ring keyboard                           |

**Aturan pakai warna:**

- `accent` (emas) HANYA untuk elemen signature (hairline rule, ikon "lunas"/checkmark penting) — jangan dipakai luas, supaya tetap terasa istimewa, bukan dekorasi berulang.
- `destructive` dipakai konsisten untuk 2 makna saja: kategori over-budget dan pembayaran/task yang lewat jatuh tempo — jangan dipakai untuk error form biasa (pakai warna netral + teks jelas untuk itu).
- Kontras teks: `foreground` di atas `background` sudah AA-compliant; pastikan teks di atas `primary`/`destructive` selalu pakai `primary-foreground` (putih), bukan `foreground`.

### CSS Variables (`app/globals.css`)

```css
:root {
  --background: 16 45% 97%;
  --foreground: 340 15% 20%;
  --card: 0 0% 100%;
  --card-foreground: 340 15% 20%;
  --popover: 0 0% 100%;
  --popover-foreground: 340 15% 20%;
  --primary: 347 35% 62%;
  --primary-foreground: 0 0% 100%;
  --secondary: 95 15% 58%;
  --secondary-foreground: 0 0% 100%;
  --muted: 20 25% 93%;
  --muted-foreground: 340 10% 40%;
  --accent: 38 45% 55%;
  --accent-foreground: 0 0% 100%;
  --destructive: 6 45% 55%;
  --destructive-foreground: 0 0% 100%;
  --border: 20 20% 88%;
  --input: 20 20% 88%;
  --ring: 347 35% 62%;
  --radius: 0.75rem;
}

.dark {
  --background: 340 12% 12%;
  --foreground: 20 25% 93%;
  --card: 340 12% 16%;
  --card-foreground: 20 25% 93%;
  --popover: 340 12% 16%;
  --popover-foreground: 20 25% 93%;
  --primary: 347 40% 68%;
  --primary-foreground: 340 15% 15%;
  --secondary: 95 15% 50%;
  --secondary-foreground: 0 0% 100%;
  --muted: 340 10% 22%;
  --muted-foreground: 20 15% 70%;
  --accent: 38 45% 58%;
  --accent-foreground: 340 15% 15%;
  --destructive: 6 50% 60%;
  --destructive-foreground: 340 15% 15%;
  --border: 340 10% 24%;
  --input: 340 10% 24%;
  --ring: 347 40% 68%;
}
```

Dark mode disiapkan untuk kelengkapan default shadcn, tapi **light mode adalah pengalaman utama** aplikasi ini (sesuai tema undangan) — tidak perlu diprioritaskan di v1, cukup pastikan tidak rusak jika sistem user default dark.

## 2. Tipografi

| Peran                                        | Font                                                  | Alasan                                                                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display (judul, nama Wedding, nominal besar) | **Bodoni Moda** (Google Fonts)                        | Serif kontras-tinggi bernuansa kartu undangan formal, tanpa jadi klise "elegant script"                                                                     |
| Body (teks UI, label, deskripsi)             | **Inter**                                             | Sangat terbaca untuk data padat (tabel, form), netral tapi hangat saat dipasangkan dengan Bodoni Moda                                                       |
| Angka (nominal Rupiah, tanggal)              | **Inter dengan `font-variant-numeric: tabular-nums`** | Semua nominal sejajar rapi di tabel — tidak perlu font monospace terpisah, cukup fitur tabular dari Inter agar tetap terasa "undangan", bukan "spreadsheet" |

Import di `app/layout.tsx` via `next/font/google`:

```ts
import { Bodoni_Moda, Inter } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
```

Tailwind config: `fontFamily: { display: ["var(--font-display)"], sans: ["var(--font-body)"] }`

**Skala tipografi:**

- Judul halaman (nama Wedding, "RAB Pernikahan"): `font-display text-3xl md:text-4xl font-medium`
- Judul kategori/section: `font-display text-xl` + hairline rule emas di bawahnya (lihat §4)
- Nominal besar (total budget di dashboard): `font-display text-2xl tabular-nums`
- Nominal di tabel/baris: `font-sans text-sm tabular-nums`
- Body/label: `font-sans text-sm`
- Caption/meta (tanggal, status kecil): `font-sans text-xs text-muted-foreground`

## 3. Bentuk, Spacing, Elevasi

- **Radius:** `0.75rem` (soft rounded, bukan tajam ala broadsheet, bukan juga pill penuh) — dipakai konsisten di Card, Button, Input, Badge.
- **Border, bukan shadow, untuk pemisah default:** card memakai `border border-border` tipis 1px; shadow (`shadow-sm`→`shadow-md`) hanya muncul saat hover/dialog/popover terangkat — menjaga tampilan tetap tenang dan datar seperti kertas undangan, bukan UI SaaS bertumpuk.
- **Spacing:** gunakan skala Tailwind default tapi condong ke lapang (`p-6`/`gap-6` untuk card, `py-12` antar section) — kepadatan rendah supaya terasa tenang, bukan seperti admin panel padat.

### 3.1 Breakpoint & Container (wajib, mobile-first)

Ini yang sebelumnya tidak eksplisit dan kemungkinan besar jadi penyebab halaman terasa kaku — semua styling **wajib ditulis untuk mobile dulu (tanpa prefix), baru ditambah varian `sm:`/`md:`/`lg:`** untuk layar lebih besar, bukan sebaliknya.

| Breakpoint          | Lebar    | Pemakaian                                                               |
| ------------------- | -------- | ----------------------------------------------------------------------- |
| base (tanpa prefix) | < 640px  | Layout utama — HP, prioritas utama                                      |
| `sm:`               | ≥ 640px  | HP besar/phablet — biasanya tidak butuh perubahan besar                 |
| `md:`               | ≥ 768px  | Tablet — `<Table>` sungguhan mulai boleh dipakai (lihat §5 catatan RAB) |
| `lg:`               | ≥ 1024px | Desktop — grid multi-kolom, sidebar nav aktif                           |

- **Padding halaman:** `px-4 md:px-6 lg:px-8` di container utama tiap halaman — jangan pakai padding tetap yang sama di semua ukuran.
- **Max-width konten:** halaman form/detail (Sheet, halaman single-column) dibatasi `max-w-lg` biar tetap enak dibaca saat dibuka di layar lebar; halaman dashboard/list dibatasi `max-w-5xl mx-auto`.
- **Cegah overflow horizontal:** `overflow-x-hidden` di `<body>`, dan setiap elemen yang berpotensi lebih lebar dari layar (badge panjang, nominal besar, nama kategori panjang) wajib `truncate` atau `flex-wrap`, bukan dibiarkan mendorong layout melebar.
- **Touch target minimum:** semua elemen yang bisa ditekan (`Button`, `Checkbox`, item `<BottomNav />`) minimal tinggi `h-11` (44px) dengan area tap yang cukup — jangan pakai varian `size="sm"` shadcn untuk aksi utama di mobile.

## 4. Signature Element: Hairline Rule & Ledger Row

Setiap judul kategori (di halaman RAB, Vendor, Checklist) memakai pola berikut:

```
Venue & Dekorasi                                    Rp 45.000.000
─────────────────────────────────────────────────  (garis tipis --accent, 1px, opacity 60%)
```

Implementasi Tailwind: `border-b border-accent/60 pb-2 mb-3 flex items-baseline justify-between font-display`

Baris item budget/pembayaran ("ledger row") memakai pola sejajar serupa: nama item di kiri (font-sans), nominal di kanan (font-sans tabular-nums), dipisah border-bottom `border-border` tipis antar baris — bukan garis tabel penuh/grid berat.

## 5. Pemetaan Komponen shadcn/ui per Fitur

Install via `npx shadcn@latest add <nama>`. Ikon pakai **lucide-react** (bawaan ekosistem shadcn/ui) — setiap tombol aksi dan item navigasi selalu **ikon + label teks**, tidak ada ikon polos tanpa teks (supaya jelas fungsinya tanpa harus menebak, terutama untuk pengguna yang tidak terbiasa dengan app finansial).

| Fitur                        | Komponen shadcn yang dipakai                                                                                                                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout umum                  | `card`, `separator`, `avatar` — navigasi utama pakai `<BottomNav />` kustom (lihat §7), form pakai `sheet` (bottom drawer), bukan `dialog` tengah, di breakpoint mobile                                                                                                           |
| Dashboard ringkasan          | `card`, `progress` (dikustom jadi tipis, warna `secondary`/`destructive` sesuai status)                                                                                                                                                                                           |
| RAB (kategori & budget item) | Base (mobile): SELALU `<LedgerRow>` per item dalam `Card` per kategori (tidak pernah elemen `<table>` di layar < 768px). Baru pada `md:` ke atas, ganti ke `table` shadcn sungguhan. `badge` (status over/under budget), `sheet` (form tambah/edit, lihat §7.2), `input`, `label` |
| Vendor & Payment             | `card`, `badge` (status lunas/belum), `calendar` + `popover` (date picker jatuh tempo), `sheet` (form tambah/edit, tombol simpan sticky bawah)                                                                                                                                    |
| Checklist                    | `checkbox`, `badge` (status task), `select` (assign member), `tabs` (filter status)                                                                                                                                                                                               |
| Auth (login/register)        | `card`, `input`, `label`, `button`, `form` (react-hook-form + zod resolver)                                                                                                                                                                                                       |
| Notifikasi aksi              | `sonner` (toast) — gaya lembut, bukan warna mencolok default                                                                                                                                                                                                                      |
| Konfirmasi hapus             | `alert-dialog`                                                                                                                                                                                                                                                                    |

**Kustomisasi badge status** (bukan warna default shadcn):

- Budget "Aman": `bg-secondary/15 text-secondary border-secondary/30`
- Budget "Over": `bg-destructive/15 text-destructive border-destructive/30`
- Payment "Lunas": `bg-secondary/15 text-secondary` + ikon check emas kecil (`text-accent`)
- Payment "Jatuh tempo < 7 hari": `bg-accent/15 text-accent border-accent/30`
- Payment "Overdue": `bg-destructive/15 text-destructive`

## 7. Navigasi & Tombol — Mobile-First

Prinsip utama: **navigasi dan aksi utama selalu berada di zona ibu jari (bottom area layar)**, bukan di pojok atas — supaya nyaman dipakai satu tangan saat user sedang di lokasi vendor/venue.

### 7.1 Bottom Tab Bar (navigasi utama)

Fixed di bawah layar pada semua halaman dashboard (`/wedding/[weddingId]/**`), 5 item maksimum, tiap item **ikon + label teks** (bukan ikon saja):

```
┌──────────────────────────────────────────────────┐
│   🏠          📊          🏢          ✅        ⋯   │
│ Ringkasan    RAB       Vendor     Checklist  Lainnya │
└──────────────────────────────────────────────────┘
```

- Komponen kustom `<BottomNav />` di `/components/wedding`, dibangun dari `Link` + ikon lucide-react (`Home`, `Wallet`, `Store`, `CheckSquare`, `MoreHorizontal`) + label `text-xs`.
- Item aktif memakai warna `primary` (Dusty Rose) untuk ikon+teks; item nonaktif memakai `muted-foreground`.
- Styling: `fixed bottom-0 inset-x-0 bg-card border-t border-border`, tinggi ~64px, ditambah `padding-bottom: env(safe-area-inset-bottom)` supaya aman di iPhone dengan home indicator saat di-install sebagai PWA.
- Konten halaman diberi `padding-bottom` secukupnya (misal `pb-20`) supaya tidak tertutup bottom nav.
- Di layar lebar (desktop, `md:` ke atas), `<BottomNav />` disembunyikan (`md:hidden`) dan digantikan sidebar kiri sederhana dengan item yang sama (ikon + label, vertikal) — tapi ini prioritas sekunder, fokus utama tetap tampilan mobile.

### 7.2 Tombol Aksi Utama — Sticky di Bawah

Setiap form (tambah kategori, tambah budget item, tambah vendor, tambah pembayaran, dst) dibuka sebagai **`Sheet` dari bawah** (bottom drawer), bukan `Dialog` di tengah layar.

**Konfigurasi wajib** (celah yang sebelumnya bikin Sheet default slide dari kanan, bukan bawah):

```tsx
<Sheet>
  <SheetContent
    side="bottom"
    className="max-h-[85vh] rounded-t-2xl flex flex-col p-0"
  >
    <div className="overflow-y-auto p-6">
      {/* isi form di sini, boleh panjang & bisa di-scroll */}
    </div>
    <div className="sticky bottom-0 bg-card border-t border-border p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <Button size="lg" className="w-full h-11">
        <Save className="mr-2 h-4 w-4" /> Simpan Item
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

Poin penting: `side="bottom"` wajib eksplisit (default shadcn adalah `"right"`), `max-h-[85vh]` + `overflow-y-auto` pada konten supaya form panjang tetap bisa di-scroll tanpa mendorong tombol keluar layar, dan tombol utama ada di wrapper `sticky bottom-0` terpisah dari area scroll — bukan ikut ter-scroll bersama form.

Tombol aksi utama ("Simpan", "Tambah Item", "Tandai Lunas") **sticky menempel di bagian bawah Sheet**, selalu terlihat tanpa perlu scroll:

```
┌──────────────────────────────┐
│  ✕                Tambah Item │  <- header sheet
│                                │
│  Nama item     [___________]  │
│  Budget (Rp)   [___________]  │
│  Catatan       [___________]  │
│                                │
├──────────────────────────────┤
│   [ 💾  Simpan Item ]          │  <- sticky, full-width, icon+text
└──────────────────────────────┘
```

- Tombol full-width (`w-full`), ukuran besar (`size="lg"`), selalu pasangan ikon lucide + teks (contoh: `<Save />` + "Simpan Item", `<Plus />` + "Tambah Kategori", `<CheckCircle />` + "Tandai Lunas").
- Area sticky bawah diberi sedikit shadow ke atas (`shadow-[0_-2px_8px_rgba(0,0,0,0.05)]`) agar terpisah visual dari konten yang bisa di-scroll di atasnya.
- Untuk halaman (bukan form) yang punya satu aksi utama, misal "+ Tambah Kategori" di halaman RAB: tombol ditempatkan sebagai bar sticky di atas `<BottomNav />` (bukan floating action button bulat) — tetap ikon + teks, full-width atau rata kanan tergantung konteks, supaya konsisten dengan pola tombol sticky-bawah di seluruh app.

## 8. Aksesibilitas & Kualitas Dasar

- Semua kombinasi teks/background di §1 sudah dicek berada di kisaran AA untuk teks normal (foreground gelap di atas background terang; putih di atas primary/destructive/secondary).
- Focus ring wajib terlihat (`ring` token), jangan dihilangkan (`focus-visible:ring-2 focus-visible:ring-ring`).
- Hormati `prefers-reduced-motion` — animasi transisi (misal progress bar, dialog) di-skip/dipercepat jika user mengaktifkan reduce motion di OS.
- **Viewport meta wajib** di `app/layout.tsx`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />` — tanpa `viewport-fit=cover`, `env(safe-area-inset-bottom)` yang dipakai `<BottomNav />` (§7.1) tidak akan berfungsi dan bottom nav bisa terpotong di HP ber-notch.
- Responsive: ikuti aturan breakpoint & container di §3.1 secara konsisten di semua halaman — base style untuk mobile dulu, jangan sebaliknya (styling desktop lalu "diperbaiki" untuk mobile belakangan, karena itu yang biasanya menghasilkan tampilan kaku).

---

Dokumen terkait: `01-PRD.md`, `02-TECHNICAL-SPEC.md`, `03-DATABASE-SCHEMA.md`, `04-API-SPEC.md`, `05-IMPLEMENTATION-PLAN.md`
