import { AlertTriangle, CheckCircle, Clock, Ticket } from "lucide-react";
import {
  getStatCards,
  getStatusDistribution,
  getTicketsByDay,
  getTicketsByAgent,
} from "@/lib/queries/dashboard.queries";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { TicketsByDayChart } from "@/components/dashboard/TicketsByDayChart";
import { TicketsByAgentChart } from "@/components/dashboard/TicketsByAgentChart";

export default async function DashboardPage() {
  const [stats, statusDist, ticketsByDay, ticketsByAgent] = await Promise.all([
    getStatCards(),
    getStatusDistribution(),
    getTicketsByDay(30),
    getTicketsByAgent(),
  ]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="grid gap-3 grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="Tickets abertos"
          value={stats.open}
          icon={<Ticket className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Em progresso"
          value={stats.inProgress}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          title="Resolvidos hoje"
          value={stats.resolvedToday}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Urgentes abertos"
          value={stats.urgent}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Tickets criados (últimos 30 dias)
          </h3>
          <TicketsByDayChart data={ticketsByDay} />
        </div>

        <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Tickets por status
          </h3>
          <StatusPieChart data={statusDist} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Tickets abertos por agente
        </h3>
        <TicketsByAgentChart data={ticketsByAgent} />
      </div>
    </div>
  );
}
