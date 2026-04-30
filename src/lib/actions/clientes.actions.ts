"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";
import { ClienteSchema } from "@/lib/validations/cliente.schema";

type State = { error?: Record<string, string[]>; success?: boolean } | undefined;

export async function createCliente(
  _prevState: State,
  formData: FormData
): Promise<State> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = ClienteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const companyId = await getCompanyId();

  const { error } = await supabase.from("clients").insert({
    ...parsed.data,
    user_id: user.id,
    company_id: companyId,
  });
  if (error) return { error: { _root: [error.message] } };

  revalidatePath("/clientes");
  return { success: true };
}

export async function updateCliente(
  id: string,
  _prevState: State,
  formData: FormData
): Promise<State> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = ClienteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("clients")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: { _root: [error.message] } };

  revalidatePath("/clientes");
  return { success: true };
}

export async function deleteCliente(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("clients")
    .update({ deletado: true })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/clientes");
  return { success: true };
}
