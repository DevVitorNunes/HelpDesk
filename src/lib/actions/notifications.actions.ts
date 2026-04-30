"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function markNotificationRead(id: string) {
  const supabase = await getSupabaseServerClient();
  await supabase
    .from("notifications")
    .update({ lida: true })
    .eq("id", id);
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = await getSupabaseServerClient();
  await supabase
    .from("notifications")
    .update({ lida: true })
    .eq("usuario_id", userId)
    .eq("lida", false);
}
