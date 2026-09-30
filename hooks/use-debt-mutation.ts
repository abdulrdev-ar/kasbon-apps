"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type Options = {
  method: "POST" | "PATCH" | "DELETE";
  url: string;
  success: string;
};
type Outcome = { ok: true } | { ok: false; errors?: Record<string, string> };
// Shape of apiError() in lib/supabase.ts.
type ApiError = { error?: string; errors?: Record<string, string> };

export function useDebtMutation() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [refreshing, startTransition] = useTransition();

  async function mutate(
    { method, url, success }: Options,
    body?: unknown,
  ): Promise<Outcome> {
    setSending(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const json: ApiError = await res.json();
        toast.error(json.error ?? "Gagal menyimpan. Coba lagi, ya.");
        if (res.status === 401) router.push("/login");
        return { ok: false, errors: json.errors };
      }
      toast.success(success);
      startTransition(() => router.refresh());
      return { ok: true };
    } catch {
      toast.error(
        "Gagal terhubung ke server. Cek internet kamu, lalu coba lagi.",
      );
      return { ok: false };
    } finally {
      setSending(false);
    }
  }

  return { mutate, pending: sending || refreshing };
}
