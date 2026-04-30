import { Clock, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { TicketHistory as TH, AppUser } from "@/types/app.types";

type HistoryEntry = TH & { users: Pick<AppUser, "id" | "name"> };

const FIELD_LABELS: Record<string, string> = {
  title: "Título",
  description: "Descrição",
  status: "Status",
  priority: "Prioridade",
  agente_id: "Agente",
};

interface TicketHistoryProps {
  history: HistoryEntry[];
}

export function TicketHistory({ history }: TicketHistoryProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-400">Nenhuma alteração registrada.</p>
    );
  }

  return (
    <ol className="relative border-l border-border pl-5 flex flex-col gap-4">
      {history.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[21px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-light ring-4 ring-white">
            <Clock className="h-2.5 w-2.5 text-orange-600" />
          </span>

          <div className="rounded-lg border border-border bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-800">
                <span className="font-semibold">
                  {FIELD_LABELS[entry.campo] ?? entry.campo}
                </span>{" "}
                alterado
                {entry.valor_anterior && (
                  <>
                    {" "}de{" "}
                    <span className="rounded bg-red-50 px-1 text-red-700 line-through">
                      {entry.valor_anterior}
                    </span>
                  </>
                )}
                {entry.valor_novo && (
                  <>
                    {" "}para{" "}
                    <span className="rounded bg-green-50 px-1 text-green-700">
                      {entry.valor_novo}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {entry.users?.name ?? "Sistema"}
              </span>
              <span>{formatDate(entry.created_at)}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
