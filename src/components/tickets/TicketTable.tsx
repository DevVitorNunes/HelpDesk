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
        action={
          <Button onClick={onNew}>Novo ticket</Button>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
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
  );
}
