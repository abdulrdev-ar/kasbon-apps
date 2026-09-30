"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";

export type AuthResult = { error?: string; info?: string };
type Credentials = { email: string; password: string };

export async function login(values: Credentials): Promise<AuthResult> {
  if (values.email.trim().length == 0 || values.password.length == 0)
    return { error: "Email dan password wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email.trim(),
    password: values.password,
  });
  if (error) return { error: "Email atau password salah." };
  redirect("/");
}

export async function signup(values: Credentials): Promise<AuthResult> {
  if (values.email.trim().length == 0 || values.password.length == 0)
    return { error: "Email dan password wajib diisi." };

  if (values.password.trim().length < 8)
    return { error: "Email wajib diisi dan password minimal 8 karakter." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email.trim(),
    password: values.password,
  });
  if (error) {
    const taken = error.code === "user_already_exists";
    const badEmail = error.code === "email_address_invalid";
    return {
      error: taken
        ? "Email ini sudah terdaftar. Coba login aja."
        : badEmail
          ? "Email ini tidak bisa dipakai. Coba email lain."
          : "Gagal daftar. Coba lagi, ya.",
    };
  }
  // No session means the project requires email confirmation first.
  if (!data.session)
    return { info: "Cek email kamu, klik link konfirmasinya, lalu login." };
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
