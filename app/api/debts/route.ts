import { NextResponse, type NextRequest } from "next/server";
import { debtSchema, fieldErrors, filtersSchema, listDebts } from "@/lib/debts";
import { SERVER_ERROR, apiError, requireUser } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const filters = filtersSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!filters.success)
    return apiError("Filternya tidak valid.", 400, fieldErrors(filters.error));

  const { data, error } = await listDebts(supabase, filters.data);
  if (error) return apiError(SERVER_ERROR, 500);
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const { supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body: unknown = await request.json().catch(() => null);
  const parsed = debtSchema.safeParse(body);
  if (!parsed.success)
    return apiError(
      "Invalid Request. Silahkan periksa kembali",
      422,
      fieldErrors(parsed.error),
    );

  const { data, error } = await supabase
    .from("debts")
    .insert(parsed.data)
    .select()
    .single();
  if (error) return apiError(SERVER_ERROR, 500);
  return NextResponse.json({ data }, { status: 201 });
}
