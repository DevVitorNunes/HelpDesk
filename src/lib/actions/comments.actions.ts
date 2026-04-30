"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";

type State = { error?: string } | undefined;

export async function createComment(
  ticketId: string,
  _prevState: State,
  formData: FormData
): Promise<State> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = (formData.get("body") as string)?.trim();
  if (!body) return { error: "Comentário não pode ser vazio" };

  const companyId = await getCompanyId();

  const { error } = await supabase.from("comments").insert({
    body,
    author_id: user.id,
    ticket_id: ticketId,
    company_id: companyId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/tickets/${ticketId}`);
}

export async function updateComment(
  commentId: string,
  body: string
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trimmed = body.trim();
  if (!trimmed) return { error: "Comentário não pode ser vazio" };

  const { error } = await supabase
    .from("comments")
    .update({ body: trimmed })
    .eq("id", commentId);

  if (error) return { error: error.message };
  return {};
}

export async function deleteComment(
  commentId: string,
  ticketId: string
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) return { error: error.message };

  revalidatePath(`/tickets/${ticketId}`);
  return {};
}
