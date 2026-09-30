import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  Constants,
  type Database,
  type Enums,
  type Tables,
} from "@/lib/database.types";

// Derived from the generated types, so `supabase gen types` keeps them in sync with the DB.
export type Debt = Tables<"debts">;
export type DebtType = Enums<"debt_type">;
export const DEBT_TYPES = Constants.public.Enums.debt_type;
export const MAX_AMOUNT = 1_000_000_000_000;
export const MAX_NOTE = 200;

// Round-trip rejects dates like 2026-02-31 that Date.parse would silently roll over.
const isDate = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(v).toISOString().slice(0, 10) === v;

// Shared by the form (zodResolver) and the API, so client and server enforce the same rules.
export const debtSchema = z.object(
  {
    type: z.enum(DEBT_TYPES, {
      error: "Pilih dulu: kamu yang dihutang atau kamu yang hutang.",
    }),
    counterpart_name: z
      .string({ error: "Nama orangnya jangan dikosongin." })
      .trim()
      .min(1, "Nama orangnya jangan dikosongin.")
      .max(100, "Nama kepanjangan, maksimal 100 karakter."),
    amount: z
      .number({ error: "Jumlahnya diisi angka, ya." })
      .int("Jumlah harus angka bulat, tanpa koma.")
      .positive("Jumlah harus lebih dari 0.")
      .max(MAX_AMOUNT, "Jumlahnya kegedean, maksimal Rp 1 triliun."),
    note: z
      .string({ error: "Catatan harus berupa teks." })
      .trim()
      .max(MAX_NOTE, `Catatan maksimal ${MAX_NOTE} karakter.`)
      .nullish()
      .transform((v) => v || null),
    due_date: z
      .string({ error: "Format tanggal tidak valid." })
      .refine((v) => !v || isDate(v), "Format tanggal tidak valid.")
      .nullish()
      .transform((v) => v || null),
  },
  { error: "Body harus berupa JSON object." },
);

export const debtPatchSchema = debtSchema.partial().extend({
  settled: z.boolean({ error: "settled harus true atau false." }).optional(),
});

export type DebtFormInput = z.input<typeof debtSchema>;
export type DebtFormOutput = z.output<typeof debtSchema>;

export const STATUSES = ["unsettled", "settled"] as const;
export const SORTS = ["newest", "oldest", "amount_desc", "amount_asc"] as const;

export const filtersSchema = z.object({
  status: z
    .enum(STATUSES, { error: "Filter status harus unsettled atau settled." })
    .optional(),
  type: z
    .enum(DEBT_TYPES, { error: "Filter tipe harus owed_to_me atau i_owe." })
    .optional(),
  q: z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .optional(),
  sort: z
    .enum(SORTS, { error: `Sort harus salah satu dari: ${SORTS.join(", ")}.` })
    .default("newest"),
});

export type Filters = z.output<typeof filtersSchema>;

// First message per field, e.g. { amount: "Jumlah harus lebih dari 0." }.
export const fieldErrors = (error: z.ZodError) =>
  Object.fromEntries(
    error.issues
      .toReversed()
      .map((i) => [String(i.path[0] ?? "body"), i.message]),
  );

export function listDebts(
  supabase: SupabaseClient<Database>,
  { status, type, q, sort }: Filters,
) {
  let query = supabase.from("debts").select("*");
  if (status === "settled") query = query.not("settled_at", "is", null);
  if (status === "unsettled") query = query.is("settled_at", null);
  if (type) query = query.eq("type", type);
  if (q) query = query.ilike("counterpart_name", `%${q}%`);

  if (sort === "amount_desc" || sort === "amount_asc") {
    query = query.order("amount", { ascending: sort === "amount_asc" });
  } else {
    const ascending = sort === "oldest";
    query = query.order("due_date", { ascending, nullsFirst: false });
  }
  return query.order("created_at", { ascending: false });
}

export function summarize(debts: Pick<Debt, "type" | "amount">[]) {
  let owedToMe = 0;
  let iOwe = 0;
  for (const d of debts) {
    if (d.type === "owed_to_me") owedToMe += d.amount;
    else iOwe += d.amount;
  }
  return { owedToMe, iOwe, net: owedToMe - iOwe };
}

const TIME_ZONE = "Asia/Jakarta";
const toLocalDate = (date: Date) =>
  date.toLocaleDateString("id-ID", { timeZone: TIME_ZONE });
export const todayISO = () => toLocalDate(new Date());

const relative = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
// Accepts a `date` (YYYY-MM-DD) or a `timestamptz` string.
export function formatRelativeDate(value: string) {
  const day = value.length > 10 ? toLocalDate(new Date(value)) : value;
  const days = Math.round(
    (Date.parse(day) - Date.parse(todayISO())) / 86_400_000,
  );
  const abs = Math.abs(days);
  if (abs < 7) return relative.format(days, "day");
  if (abs < 30) return relative.format(Math.trunc(days / 7), "week");
  if (abs < 365) return relative.format(Math.trunc(days / 30), "month");
  return relative.format(Math.trunc(days / 365), "year");
}
