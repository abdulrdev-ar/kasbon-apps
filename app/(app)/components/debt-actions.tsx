"use client";

import { Check, Pencil, Trash2, Undo2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DebtFormDialog } from "@/app/(app)/components/debt-form-dialog";
import type { Debt } from "@/lib/debts";
import { formatRupiah } from "@/lib/utils";
import { useDebtMutation } from "@/hooks/use-debt-mutation";

export function DebtActions({ debt }: { debt: Debt }) {
  const settle = useDebtMutation();
  const remove = useDebtMutation();
  const settled = Boolean(debt.settled_at);
  const url = `/api/debts/${debt.id}`;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={settled ? "ghost" : "outline"}
        disabled={settle.pending}
        onClick={() =>
          settle.mutate(
            {
              method: "PATCH",
              url,
              success: settled
                ? "Status dibalikin ke belum lunas."
                : "Telah lunas!",
            },
            { settled: !settled },
          )
        }
      >
        {settle.pending ? (
          <Spinner />
        ) : settled ? (
          <Undo2 aria-hidden />
        ) : (
          <Check aria-hidden />
        )}
        {settled ? "Batal lunas" : "Tandai lunas"}
      </Button>

      <DebtFormDialog debt={debt}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit catatan ${debt.counterpart_name}`}
        >
          <Pencil aria-hidden />
        </Button>
      </DebtFormDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Hapus catatan ${debt.counterpart_name}`}
          >
            <Trash2 aria-hidden />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus catatan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan {debt.counterpart_name} sebesar{" "}
              {formatRupiah(debt.amount)} akan hilang dan tidak dapat
              dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.pending}
              onClick={() =>
                remove.mutate({
                  method: "DELETE",
                  url,
                  success: "Catatan dihapus.",
                })
              }
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
