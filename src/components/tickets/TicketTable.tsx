"use client";

import { Pencil, Ticket } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatDateShort } from "@/lib/utils";
import type { TicketWithRelations } from "@/types/app.types";

interface TicketTableProps {
  tickets: TicketWithRelations[];
  onNew?: () => void;
  onEdit?: (ticket: TicketWithRelations) => void;
}

export function TicketTable({ tickets, onNew, onEdit }: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Ticket className="h-12 w-12" />}
        title="Nenhum ticket encontrado"
        description="Tente ajustar os filtros ou crie um novo ticket."
        action={<Button onClick={onNew}>Novo ticket</Button>}
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-white md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Agente</th>
              <th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 line-clamp-1">
                    {ticket.title}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {ticket.clients?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {ticket.agentes?.nome ?? (
                    <span className="text-gray-400">Não atribuído</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDateShort(ticket.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit?.(ticket)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            onClick={() => onEdit?.(ticket)}
            className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="line-clamp-2 flex-1 font-medium text-gray-900">
                {ticket.title}
              </span>
              <Pencil className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
              <span>
                Cliente:{" "}
                <span className="text-gray-700">{ticket.clients?.name ?? "—"}</span>
              </span>
              <span aria-hidden>·</span>
              <span>
                Agente:{" "}
                <span className="text-gray-700">
                  {ticket.agentes?.nome ?? "Não atribuído"}
                </span>
              </span>
              <span aria-hidden>·</span>
              <span>{formatDateShort(ticket.created_at)}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
