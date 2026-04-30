import { getTickets } from "@/lib/queries/tickets.queries";
import { getAgentes } from "@/lib/queries/agentes.queries";
import { getClientes } from "@/lib/queries/clientes.queries";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { TicketsManager } from "@/components/tickets/TicketsManager";
import type { TicketFilters as TFilters, TicketStatus, TicketPriority } from "@/types/app.types";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function TicketsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const filters: TFilters = {
    search: sp.search,
    status: sp.status as TicketStatus | undefined,
    priority: sp.priority as TicketPriority | undefined,
    agente_id: sp.agente_id,
    client_id: sp.client_id,
    created_date: sp.created_date,
    page: sp.page ? Number(sp.page) : 1,
  };

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();

  const [{ tickets, total, totalPages }, agentes, clientes] = await Promise.all([
    getTickets(filters),
    getAgentes(),
    getClientes(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <TicketsManager
        tickets={tickets}
        total={total}
        totalPages={totalPages}
        page={filters.page ?? 1}
        agentes={agentes.map((a) => ({ id: a.id, nome: a.nome }))}
        clientes={clientes.map((c) => ({ id: c.id, name: c.name }))}
        userId={user!.id}
        isAdmin={profile?.role === "admin"}
      />
    </div>
  );
}
