"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, getSupabaseServiceClient, getCompanyId } from "@/lib/supabase/server";
import { AgenteSchema } from "@/lib/validations/agente.schema";

type State = { error?: Record<string, string[]>; success?: boolean } | undefined;

export async function createAgente(
  _prevState: State,
  formData: FormData
): Promise<State> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = AgenteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { nome, email, telefone, password } = parsed.data;
  if (!password) return { error: { password: ["Senha é obrigatória para novo agente"] } };

  const companyId = await getCompanyId();
  const adminClient = await getSupabaseServiceClient();

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "agente" },
    user_metadata: { name: nome, company_id: companyId },
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already been registered") ||
      msg.includes("already in use") ||
      msg.includes("already exists")
    ) {
      return { error: { email: ["Este e-mail já está cadastrado"] } };
    }
    return { error: { _root: ["Erro ao criar usuário. Tente novamente."] } };
  }

  const { error } = await supabase.from("agentes").insert({
    nome,
    email,
    telefone: telefone ?? null,
    user_id: authData.user.id,
    company_id: companyId,
  });

  if (error) return { error: { _root: [error.message] } };

  revalidatePath("/agentes");
  return { success: true };
}

export async function updateAgente(
  id: string,
  _prevState: State,
  formData: FormData
): Promise<State> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = AgenteSchema.omit({ password: true }).safeParse(
    Object.fromEntries(formData)
  );
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("agentes")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: { _root: [error.message] } };

  revalidatePath("/agentes");
  return { success: true };
}

export async function deleteAgente(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("agentes")
    .update({ deletado: true })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/agentes");
  return { success: true };
}
