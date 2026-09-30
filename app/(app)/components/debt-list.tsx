import { NotebookPen, Plus, SearchX } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DebtActions } from "@/app/(app)/components/debt-actions";
import { DebtFormDialog } from "@/app/(app)/components/debt-form-dialog";
import type { Debt } from "@/lib/debts";
import { formatRelativeDate } from "@/lib/debts";
import { formatRupiah } from "@/lib/utils";

export function DebtList({
  debts,
  hasAny,
}: {
  debts: Debt[];
  hasAny: boolean;
}) {
  if (!hasAny) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NotebookPen />
          </EmptyMedia>
          <EmptyTitle>Belum ada catatan</EmptyTitle>
          <EmptyDescription>
            Ada teman yang pinjam uang, atau kamu yang pinjam? Catat sekarang
            biar tidak lupa.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <DebtFormDialog>
            <Button size="lg">
              <Plus aria-hidden />
              Catat kasbon pertama
            </Button>
          </DebtFormDialog>
        </EmptyContent>
      </Empty>
    );
  }

  if (!debts.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Tidak ada yang cocok</EmptyTitle>
          <EmptyDescription>
            Coba ganti kata kunci atau filternya.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">Hapus semua filter</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-3">
        <CardTitle>Semua catatan</CardTitle>
        <CardDescription>{debts.length} catatan</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="divide-y">
          {debts.map((debt) => (
            <DebtRow key={debt.id} debt={debt} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DebtRow({ debt }: { debt: Debt }) {
  const settled = Boolean(debt.settled_at);
  const date = debt.due_date ?? debt.created_at;

  return (
    <li className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className="min-w-0 truncate text-sm font-medium"
            title={debt.counterpart_name}
          >
            {debt.counterpart_name}
          </p>
          <p
            className={`shrink-0 text-sm font-semibold tabular-nums md:hidden ${settled ? "text-muted-foreground" : ""}`}
          >
            {formatRupiah(debt.amount)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant={debt.type === "owed_to_me" ? "secondary" : "outline"}>
            {debt.type === "owed_to_me" ? "Dihutang" : "Saya hutang"}
          </Badge>
          <Badge variant={settled ? "default" : "outline"}>
            {settled ? "Lunas" : "Belum lunas"}
          </Badge>
          <time dateTime={date}>{formatRelativeDate(date)}</time>
        </div>
        {debt.note && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {debt.note}
          </p>
        )}
      </div>
      <p
        className={`hidden w-36 shrink-0 text-right text-sm font-semibold tabular-nums md:block ${settled ? "text-muted-foreground" : ""}`}
      >
        {formatRupiah(debt.amount)}
      </p>
      <DebtActions debt={debt} />
    </li>
  );
}
