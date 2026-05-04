"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { TicketForm } from "@/components/tickets/TicketForm";
import { CommentList } from "@/components/tickets/CommentList";
import { CommentForm } from "@/components/tickets/CommentForm";
import { AttachmentUploader } from "@/components/tickets/AttachmentUploader";
import { getTicketDetailAction, updateTicket } from "@/lib/actions/tickets.actions";
import type { Agente, Client, TicketDetail } from "@/types/app.types";

function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 select-none"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
        )}
        {title}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

interface TicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
  agentes: Pick<Agente, "id" | "nome">[];
  clientes: Pick<Client, "id" | "name">[];
  userId: string;
  isAdmin: boolean;
}

export function TicketDetailModal({
  ticketId,
  onClose,
  agentes,
  clientes,
  userId,
  isAdmin,
}: TicketDetailModalProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshTicket = useCallback(async () => {
    if (!ticketId) return;
    const data = await getTicketDetailAction(ticketId);
    setTicket(data);
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      return;
    }
    setLoading(true);
    getTicketDetailAction(ticketId).then((data) => {
      setTicket(data);
      setLoading(false);
    });
  }, [ticketId]);

  function handleSaveSuccess() {
    onClose();
    router.refresh();
  }

  async function handleCommentSuccess() {
    await refreshTicket();
    toast.success("Comentário adicionado!");
  }

  async function handleAttachmentChange() {
    await refreshTicket();
  }

  return (
    <Modal
      open={!!ticketId}
      onClose={onClose}
      title={ticket?.title ?? "Detalhes do Ticket"}
      className="sm:max-w-5xl h-[700px] max-h-[700px]"
      contentClassName="flex-1 min-h-0 overflow-hidden p-0 sm:p-0"
    >
      {loading || !ticket ? (
        <div className="flex items-center justify-center h-full">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] grid-cols-1 h-full divide-x divide-border">
          {/* Left column: form */}
          <div className="p-6 overflow-y-auto scrollbar-thin">
            <TicketForm
              key={ticket.id}
              ticket={ticket}
              agentes={agentes}
              clientes={clientes}
              action={updateTicket.bind(null, ticket.id)}
              showStatus
              onSuccess={handleSaveSuccess}
              onCancel={onClose}
            />
          </div>

          {/* Right column: fixed comment input + single-scroll accordion body */}
          <div className="flex flex-col h-full min-h-0">
            {/* Fixed header: compact CommentForm */}
            <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Novo comentário
              </p>
              <CommentForm ticketId={ticket.id} onSuccess={handleCommentSuccess} />
            </div>

            {/* Single scrollable body with accordion sections */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4">
              <AccordionSection
                title={`Comentários (${ticket.comments.length})`}
              >
                <CommentList
                  comments={ticket.comments}
                  ticketId={ticket.id}
                  userId={userId}
                  isAdmin={isAdmin}
                  onRefresh={refreshTicket}
                />
              </AccordionSection>

              <div className="border-t border-border" />

              <AccordionSection
                title={`Anexos (${ticket.attachments.length})`}
              >
                <AttachmentUploader
                  ticketId={ticket.id}
                  attachments={ticket.attachments}
                  userId={userId}
                  onSuccess={handleAttachmentChange}
                />
              </AccordionSection>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
