import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";
import type { Notification } from "@/types/app.types";

export async function getNotifications(userId: string): Promise<Notification[]> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("usuario_id", userId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}
