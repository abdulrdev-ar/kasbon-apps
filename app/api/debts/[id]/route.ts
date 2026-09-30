import { NextResponse, type NextRequest } from "next/server";
import { debtPatchSchema, fieldErrors } from "@/lib/debts";
import { SERVER_ERROR, apiError, requireUser } from "@/lib/supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOT_FOUND = "Catatan ini tidak ketemu. Mungkin sudah dihapus.";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/debts/[id]">,
) {
  const { supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  if (!UUID.test(id)) return apiError(NOT_FOUND, 404);

  const body: unknown = await request.json().catch(() => null);
  const parsed = debtPatchSchema.safeParse(body);
  if (!parsed.success)
    return apiError(
      "Invalid Request. Silahkan periksa kembali",
      422,
      fieldErrors(parsed.error),
    );

  const { settled, ...fields } = parsed.data;
  if (settled === undefined && !Object.keys(fields).length)
    return apiError("tidak ada yang diubah.", 400);

  // RLS hides other users' rows, so "not mine" and "doesn't exist" both land here as 404.
  const current = await supabase
    .from("debts")
    .select("settled_at")
    .eq("id", id)
    .maybeSingle();
  if (current.error) return apiError(SERVER_ERROR, 500);
  if (!current.data) return apiError(NOT_FOUND, 404);

  // Idempotent: settling twice keeps the first settled_at instead of bumping it.
  const settled_at =
    settled === undefined
      ? current.data.settled_at
      : settled
        ? (current.data.settled_at ?? new Date().toISOString())
        : null;

  const { data, error } = await supabase
    .from("debts")
    .update({ ...fields, settled_at })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return apiError(SERVER_ERROR, 500);
  if (!data) return apiError(NOT_FOUND, 404);
  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/debts/[id]">,
) {
  const { supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  if (!UUID.test(id)) return apiError(NOT_FOUND, 404);

  const { data, error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return apiError(SERVER_ERROR, 500);
  if (!data.length) return apiError(NOT_FOUND, 404);
  return new NextResponse(null, { status: 204 });
}
