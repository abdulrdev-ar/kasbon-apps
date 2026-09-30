import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DebtFilters } from "@/app/(app)/components/debt-filters";
import { DebtFormDialog } from "@/app/(app)/components/debt-form-dialog";
import { DebtList } from "@/app/(app)/components/debt-list";
import { DebtSummary } from "@/app/(app)/components/debt-summary";
import { filtersSchema, listDebts, summarize } from "@/lib/debts";
import { createClient } from "@/lib/supabase";

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const parsed = filtersSchema.safeParse(await searchParams);
  const filters = parsed.success ? parsed.data : { sort: "newest" as const };

  const supabase = await createClient();
  const [list, all] = await Promise.all([
    listDebts(supabase, filters),
    supabase.from("debts").select("type, amount, settled_at"),
  ]);
  if (list.error || all.error) throw new Error("Gagal memuat catatan.");

  // Summary counts only what is still unpaid, whatever filter the list uses.
  const summary = summarize(all.data.filter((d) => !d.settled_at));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Kasbon kamu</h2>
          <p className="text-sm text-muted-foreground">
            Ringkasan dari catatan yang belum lunas.
          </p>
        </div>
        <DebtFormDialog>
          <Button size="lg">
            <Plus aria-hidden />
            Catat baru
          </Button>
        </DebtFormDialog>
      </div>
      <DebtSummary {...summary} />
      {all.data.length > 0 && <DebtFilters />}
      <DebtList debts={list.data} hasAny={all.data.length > 0} />
    </div>
  );
}
