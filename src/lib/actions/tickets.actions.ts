"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";
import { getTicketById } from "@/lib/queries/tickets.queries";
import { TicketSchema } from "@/lib/validations/ticket.schema";
import type { TicketStatus, TicketDetail } from "@/types/app.types";

type State = { error?: Record<string, string[]>; success?: boolean; redirectTo?: string } | undefined;

export async function createTicket(
  _prevState: State,
  formData: FormData
): Promise<State> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = TicketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const companyId = await getCompanyId();

  const { error, data } = await supabase.from("tickets").insert({
    ...parsed.data,
    status: "Aberto",
    user_id: user.id,
    company_id: companyId,
    agente_id: parsed.data.agente_id || null,
  }).select("id").single();

  if (error) return { error: { _root: [error.message] } };

  revalidatePath("/tickets");
  return { success: true };
}

export async function updateTicket(
  id: string,
  _prevState: State,
  formData: FormData
): Promise<State> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = TicketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("tickets")
    .update({ ...parsed.data, user_id: user.id, agente_id: parsed.data.agente_id || null })
    .eq("id", id);

  if (error) return { error: { _root: [error.message] } };

  revalidatePath(`/tickets/${id}`);
  revalidatePath("/tickets");
  return { success: true };
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("tickets")
    .update({ status, user_id: user.id })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/tickets/${id}`);
  revalidatePath("/tickets");
}

export async function deleteTicket(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("tickets")
    .update({ deletado: true })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/tickets");
  return { success: true };
}

export async function getTicketDetailAction(id: string): Promise<TicketDetail | null> {
  return getTicketById(id);
}
