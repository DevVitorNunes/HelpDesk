import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";
import type { Client } from "@/types/app.types";

export async function getClientes(): Promise<Client[]> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", companyId)
    .eq("deletado", false)
    .order("name");

  return data ?? [];
}

export async function getClienteById(id: string): Promise<Client | null> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .eq("deletado", false)
    .single();

  return data ?? null;
}
