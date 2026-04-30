"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { TicketForm } from "@/components/tickets/TicketForm";
import { TicketDetailModal } from "@/components/tickets/TicketDetailModal";
import { TicketTable } from "@/components/tickets/TicketTable";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import { PaginationController } from "@/components/tickets/PaginationController";
import { createTicket } from "@/lib/actions/tickets.actions";
import { Button } from "@/components/ui/Button";
import type { Agente, Client, TicketWithRelations } from "@/types/app.types";

interface TicketsManagerProps {
  tickets: TicketWithRelations[];
  total: number;
  totalPages: number;
  page: number;
  agentes: Pick<Agente, "id" | "nome">[];
  clientes: Pick<Client, "id" | "name">[];
  userId: string;
  isAdmin: boolean;
}

export function TicketsManager({
  tickets,
  total,
  totalPages,
  page,
  agentes,
  clientes,
  userId,
  isAdmin,
}: TicketsManagerProps) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

  function handleCreateSuccess() {
    setOpenCreate(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tickets</h2>
          <p className="text-sm text-gray-500">
            {total} ticket{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4" />
          Novo ticket
        </Button>
      </div>

      <TicketFilters
        agentes={agentes}
        clientes={clientes}
      />

      <TicketTable
        tickets={tickets}
        onNew={() => setOpenCreate(true)}
        onEdit={(ticket) => setEditingTicketId(ticket.id)}
      />

      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationController page={page} totalPages={totalPages} />
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Novo ticket"
        className="max-w-2xl"
      >
        <TicketForm
          action={createTicket}
          agentes={agentes}
          clientes={clientes}
          onSuccess={handleCreateSuccess}
          onCancel={() => setOpenCreate(false)}
        />
      </Modal>

      {/* Edit/detail modal */}
      <TicketDetailModal
        ticketId={editingTicketId}
        onClose={() => setEditingTicketId(null)}
        agentes={agentes}
        clientes={clientes}
        userId={userId}
        isAdmin={isAdmin}
      />
    </>
  );
}
