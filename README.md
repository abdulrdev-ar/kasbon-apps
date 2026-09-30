# Kasbon

Web app sederhana buat nyatet utang piutang pribadi: siapa hutang berapa ke kamu, kamu hutang berapa ke siapa, dan mana yang sudah lunas.

**Demo:** https://kasbon-apps-plum.vercel.app/

## Stack

- Next.js 16 (App Router) + TypeScript strict
- Supabase (PostgreSQL + Auth) lewat `@supabase/ssr`
- Tailwind CSS v4 + shadcn/ui
- Lucide React (icons)

Library tambahan dan alasannya:

| Library                                      | Alasan                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `zod`                                        | Satu schema validasi dipakai di form (client) dan di API (server), jadi aturannya tidak bisa beda.                                                                                                           |
| `react-hook-form` + `@hookform/resolvers`    | State form dan error per field tanpa nulis `useState` satu-satu. `zodResolver` nyambungin ke schema zod yang sama.                                                                                           |
| `react-currency-input-field`                 | Input jumlah langsung tampil sebagai `Rp 1.234.000` saat diketik (locale `id-ID`), tapi nilai yang dikirim ke API tetap angka bulat. Dibungkus di `components/ui/input.tsx` dengan styling shadcn yang sama. |
| `sonner`                                     | Toast bawaan shadcn untuk feedback setelah simpan, tandai lunas, dan hapus.                                                                                                                                  |
| `radix-ui`, `class-variance-authority`, `cn` | Dependency dari komponen shadcn/ui.                                                                                                                                                                          |

## Setup lokal

Butuh Node 22 dan pnpm.

1. Install dependency:

   ```bash
   pnpm install
   ```

2. Bikin file `.env` di root project:

   ```bash
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_PUBLISHABLE_KEY=<publishable key dari Project Settings > API Keys>
   ```

   tidak pakai prefix `NEXT_PUBLIC_` karena semua panggilan ke Supabase jalan di server (Server Component, Route Handler, Server Action, `proxy.ts`). Browser tidak pernah terhubung langsung ke Supabase.

3. Jalankan migration. Pilih salah satu:
   - Buka Supabase Dashboard > SQL Editor, paste isi [`supabase/migrations/20260930000000_create_debts.sql`](supabase/migrations/20260930000000_create_debts.sql), lalu Run.
   - Atau pakai Supabase CLI: `supabase link --project-ref <project-ref>` lalu `supabase db push`.

4. Di Supabase Dashboard > Authentication > Sign In / Providers > Email, matikan **Confirm email** supaya user baru bisa langsung login setelah daftar. Kalau tetap nyala, app tetap jalan: setelah daftar, muncul pesan untuk cek email dulu.

5. Jalankan:

   ```bash
   pnpm dev
   ```

   Buka http://localhost:3000.

Perintah lain: `pnpm build`, `pnpm lint`, `pnpm exec tsc --noEmit`.

Kalau schema DB berubah, generate ulang `lib/database.types.ts` dengan `pnpm gen`. Sebelumnya, hubungkan CLI ke project Supabase kamu sekali saja:

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref <project-ref>
```

`<project-ref>` itu subdomain di `SUPABASE_URL` (`https://<project-ref>.supabase.co`). `supabase link` menyimpannya di `supabase/.temp/` .

## Database

Tabel `debts` ada di [`supabase/migrations/20260930000000_create_debts.sql`](supabase/migrations/20260930000000_create_debts.sql):

- `type` pakai enum Postgres `debt_type` (`owed_to_me` / `i_owe`).
- `amount` itu `bigint` dalam Rupiah utuh, dengan `check (amount > 0 and amount <= 1 triliun)`.
- `counterpart_name` wajib dan tidak boleh cuma spasi. `note` maksimal 200 karakter. Batasan ini dicek juga di DB, bukan cuma di app.
- `user_id` default-nya `auth.uid()`, jadi client tidak perlu (dan tidak bisa) ngirim `user_id` orang lain.
- `updated_at` diisi trigger setiap update.
- Index `(user_id, created_at desc)` untuk query list per user.

## API

Semua endpoint wajib login (401 kalau belum). Pesan error pakai Bahasa Indonesia, dengan format `{ "error": "...", "errors": { "<field>": "..." } }`.

| Method | Path              | Fungsi                                                                                                                                         | Status                         |
| ------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| GET    | `/api/debts`      | List debt milik user. Query: `status=unsettled\|settled`, `type=owed_to_me\|i_owe`, `q=<nama>`, `sort=newest\|oldest\|amount_desc\|amount_asc` | 200, 400 filter salah          |
| POST   | `/api/debts`      | Bikin entry baru                                                                                                                               | 201, 422 validasi gagal        |
| PATCH  | `/api/debts/[id]` | Update field apa aja, termasuk `{ "settled": true \| false }`                                                                                  | 200, 400 body kosong, 404, 422 |
| DELETE | `/api/debts/[id]` | Hapus entry                                                                                                                                    | 204, 404                       |

## Struktur

```
app/
  (auth)/          login, signup, server actions auth
  (app)/           dashboard (layout sidebar, page, loading, error)
  api/debts/       route handlers GET/POST, PATCH/DELETE
components/        komponen fitur: summary, list, filter, form dialog, actions
components/ui/     komponen shadcn
hooks/             use-debt-mutation (fetch + toast + refresh), use-mobile (shadcn)
lib/               debts.ts (schema zod, query, format), supabase.ts, database.types.ts
proxy.ts           refresh session + redirect halaman yang butuh login
supabase/migrations/
```

## Approach

Untuk project sekala kecil, monolith sudah cukup. Jadi tidak over engineering.

## Trade-off: kalau ada 1 hari lagi

- **Testing.** Saya mau lakukan E2E testing dengan Vitest atau Playwright apa yang dibuat sesuai dengan ekspektasi.
- **Reports.** Laporan berbetuk charts dengan recharts.
- **Pagination** di list dan di `GET /api/debts`.

## Time spent

2.5 Jam. 23:00 hingga 01:38 WIB.
