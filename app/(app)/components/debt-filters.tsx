"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const SELECTS = [
  {
    key: "status",
    label: "Status",
    options: [
      ["all", "Semua status"],
      ["unsettled", "Belum lunas"],
      ["settled", "Lunas"],
    ],
  },
  {
    key: "type",
    label: "Tipe",
    options: [
      ["all", "Semua tipe"],
      ["owed_to_me", "Dihutang ke saya"],
      ["i_owe", "Saya hutang"],
    ],
  },
  {
    key: "sort",
    label: "Urutkan",
    options: [
      ["newest", "Tanggal terbaru"],
      ["oldest", "Tanggal terlama"],
      ["amount_desc", "Jumlah terbesar"],
      ["amount_asc", "Jumlah terkecil"],
    ],
  },
] as const;

const DEFAULTS: Record<string, string> = {
  status: "all",
  type: "all",
  sort: "newest",
};

export function DebtFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === DEFAULTS[key]) next.delete(key);
    else next.set(key, value);
    startTransition(() =>
      router.replace(`${pathname}?${next}`, { scroll: false }),
    );
  }

  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    const timer = setTimeout(() => update("q", q.trim()), 300);
    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative md:max-w-64 md:flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama orang"
          aria-label="Cari nama orang"
          className="pl-7"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex">
        {SELECTS.map(({ key, label, options }) => (
          <Select
            key={key}
            value={params.get(key) ?? DEFAULTS[key]}
            onValueChange={(v) => update(key, v)}
          >
            <SelectTrigger aria-label={label} className="w-full md:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      {pending && (
        <Spinner className="text-muted-foreground" aria-label="Memuat" />
      )}
    </div>
  );
}
