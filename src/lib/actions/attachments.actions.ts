"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";

export async function saveAttachmentMetadata(
  ticketId: string,
  nome_arquivo: string,
  url: string,
  tamanho_bytes: number
) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const companyId = await getCompanyId();

  const { error } = await supabase.from("attachments").insert({
    ticket_id: ticketId,
    nome_arquivo,
    url,
    tamanho_bytes,
    uploaded_by: user.id,
    company_id: companyId,
  });

  if (error) return { error: error.message };
  revalidatePath(`/tickets/${ticketId}`);
}

export async function deleteAttachment(id: string, ticketId: string, storagePath: string) {
  const supabase = await getSupabaseServerClient();

  await supabase.storage.from("attachments").remove([storagePath]);
  await supabase.from("attachments").delete().eq("id", id);

  revalidatePath(`/tickets/${ticketId}`);
}
