import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component: cookies are read-only there. proxy.ts refreshes the session.
          }
        },
      },
    },
  );
}

export const apiError = (
  message: string,
  status: number,
  errors?: Record<string, string>,
) => NextResponse.json({ error: message, errors }, { status });

export const SERVER_ERROR =
  "Lagi ada gangguan di server. Coba lagi sebentar, ya.";

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return {
    supabase,
    unauthorized: data?.claims ? null : apiError("Kamu harus login dulu.", 401),
  };
}
