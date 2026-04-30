import { LIST_PAGE_SIZE } from "@/lib/constants/pagination";
import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";
import type {
  TicketWithRelations,
  TicketDetail,
  TicketFilters,
} from "@/types/app.types";

const TICKET_WITH_RELATIONS = `
  *,
  agentes (id, nome, email),
  clients (id, name, email),
  users (id, name)
` as const;

export async function getTickets(filters: TicketFilters = {}): Promise<{
  tickets: TicketWithRelations[];
  total: number;
  totalPages: number;
}> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const page = filters.page ?? 1;
  const from = (page - 1) * LIST_PAGE_SIZE;
  const to = from + LIST_PAGE_SIZE - 1;

  let query = supabase
    .from("tickets")
    .select(TICKET_WITH_RELATIONS, { count: "exact" })
    .eq("company_id", companyId)
    .eq("deletado", false);

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters.agente_id) {
    query = query.eq("agente_id", filters.agente_id);
  }
  if (filters.client_id) {
    query = query.eq("client_id", filters.client_id);
  }
  if (filters.created_date) {
    const day = filters.created_date;
    query = query.gte("created_at", day);
    query = query.lte("created_at", `${day}T23:59:59`);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return {
    tickets: (data as TicketWithRelations[]) ?? [],
    total,
    totalPages: Math.ceil(total / LIST_PAGE_SIZE),
  };
}

export async function getTicketById(id: string): Promise<TicketDetail | null> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);

  const { data } = await supabase
    .from("tickets")
    .select(`
      *,
      agentes (id, nome, email),
      clients (id, name, email),
      users (id, name),
      comments (*, users (id, name)),
      ticket_history (*, users (id, name)),
      attachments (*, users (id, name))
    `)
    .eq("id", id)
    .eq("company_id", companyId)
    .eq("deletado", false)
    .order("created_at", { referencedTable: "comments", ascending: true })
    .order("created_at", { referencedTable: "ticket_history", ascending: true })
    .single();

  return data as TicketDetail | null;
}
