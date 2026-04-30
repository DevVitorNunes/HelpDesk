import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";
import type { Agente } from "@/types/app.types";

export async function getAgentes(): Promise<Agente[]> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const { data } = await supabase
    .from("agentes")
    .select("*")
    .eq("company_id", companyId)
    .eq("deletado", false)
    .order("nome");

  return data ?? [];
}

export async function getAgenteById(id: string): Promise<Agente | null> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const { data } = await supabase
    .from("agentes")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .eq("deletado", false)
    .single();

  return data ?? null;
}
