import { getSupabaseServerClient, getCompanyId } from "@/lib/supabase/server";
import { getAgentes } from "@/lib/queries/agentes.queries";
import { format, subDays } from "date-fns";
import type { TicketStatus } from "@/types/app.types";

const DASHBOARD_TICKET_BATCH = 1000;

export async function getStatCards() {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const today = format(new Date(), "yyyy-MM-dd");

  const [open, inProgress, resolvedToday, urgent] = await Promise.all([
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "Aberto")
      .eq("deletado", false),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "Em progresso")
      .eq("deletado", false),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "Resolvido")
      .gte("updated_at", today)
      .eq("deletado", false),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("priority", "Urgente")
      .not("status", "in", '("Resolvido","Fechado")')
      .eq("deletado", false),
  ]);

  return {
    open: open.count ?? 0,
    inProgress: inProgress.count ?? 0,
    resolvedToday: resolvedToday.count ?? 0,
    urgent: urgent.count ?? 0,
  };
}

export async function getStatusDistribution(): Promise<
  { status: TicketStatus; count: number }[]
> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const { data } = await supabase
    .from("tickets")
    .select("status")
    .eq("company_id", companyId)
    .eq("deletado", false);

  if (!data) return [];

  const counts = data.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([status, count]) => ({
    status: status as TicketStatus,
    count,
  }));
}

export async function getTicketsByDay(
  days = 30
): Promise<{ date: string; count: number }[]> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const from = format(subDays(new Date(), days - 1), "yyyy-MM-dd");

  const { data } = await supabase
    .from("tickets")
    .select("created_at")
    .eq("company_id", companyId)
    .gte("created_at", from)
    .eq("deletado", false);

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    counts[format(subDays(new Date(), i), "yyyy-MM-dd")] = 0;
  }

  data.forEach((row) => {
    const day = format(new Date(row.created_at), "yyyy-MM-dd");
    if (day in counts) counts[day]++;
  });

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export async function getTicketsByAgent(): Promise<
  { nome: string; count: number }[]
> {
  const [supabase, companyId] = await Promise.all([
    getSupabaseServerClient(),
    getCompanyId(),
  ]);
  const agentes = await getAgentes();

  const countsByAgenteId = new Map<string, number>();
  let offset = 0;

  for (;;) {
    const { data } = await supabase
      .from("tickets")
      .select("agente_id")
      .eq("company_id", companyId)
      .not("agente_id", "is", null)
      .not("status", "in", '("Resolvido","Fechado")')
      .eq("deletado", false)
      .range(offset, offset + DASHBOARD_TICKET_BATCH - 1);

    if (!data?.length) break;

    for (const row of data) {
      const id = row.agente_id as string;
      countsByAgenteId.set(id, (countsByAgenteId.get(id) ?? 0) + 1);
    }

    if (data.length < DASHBOARD_TICKET_BATCH) break;
    offset += DASHBOARD_TICKET_BATCH;
  }

  const rows = agentes.map((a) => ({
    nome: a.nome,
    count: countsByAgenteId.get(a.id) ?? 0,
  }));

  rows.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  return rows;
}
