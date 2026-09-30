import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { summarize } from "@/lib/debts";
import { cn } from "cn";
import { formatRupiah } from "@/lib/utils";

type Summary = ReturnType<typeof summarize>;

export function DebtSummary({ owedToMe, iOwe, net }: Summary) {
  const netTone =
    net > 0 ? "text-emerald-700" : net < 0 ? "text-destructive" : "";
  const netNote =
    net > 0
      ? "Uang kamu lebih banyak di orang lain"
      : net < 0
        ? "Utang kamu lebih banyak"
        : "Impas, tidak ada selisih";

  const cards = [
    {
      title: "Total dihutang ke saya",
      icon: ArrowDownLeft,
      value: owedToMe,
      note: "Yang belum dibayar ke kamu",
    },
    {
      title: "Total saya hutang",
      icon: ArrowUpRight,
      value: iOwe,
      note: "Yang belum kamu bayar",
    },
  ];

  return (
    <section aria-label="Ringkasan" className="grid gap-3 sm:grid-cols-3">
      {cards.map(({ title, icon: Icon, value, note }) => (
        <Card key={title}>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Icon className="size-3.5" aria-hidden />
              {title}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {formatRupiah(value)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {note}
          </CardContent>
        </Card>
      ))}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Scale className="size-3.5" aria-hidden />
            Net
          </CardDescription>
          <CardTitle
            className={`text-2xl font-semibold tabular-nums ${netTone}`}
          >
            {net > 0 && "+"}
            {formatRupiah(net)}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={cn("text-xs", netTone || "text-muted-foreground")}
        >
          {netNote}
        </CardContent>
      </Card>
    </section>
  );
}
