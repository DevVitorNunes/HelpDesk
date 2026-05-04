"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { updateTicketStatus } from "@/lib/actions/tickets.actions";
import { StatusBadge } from "@/components/ui/Badge";
import { TICKET_STATUSES } from "@/types/app.types";
import type { TicketStatus } from "@/types/app.types";
import { cn } from "@/lib/utils";

interface StatusQuickChangeProps {
  ticketId: string;
  currentStatus: TicketStatus;
}

export function StatusQuickChange({ ticketId, currentStatus }: StatusQuickChangeProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function change(status: TicketStatus) {
    if (status === currentStatus) { setOpen(false); return; }
    setPending(true);
    await updateTicketStatus(ticketId, status);
    setPending(false);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm",
          "hover:bg-gray-50 disabled:opacity-60"
        )}
      >
        <StatusBadge status={currentStatus} />
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-40 max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-white py-1 shadow-lg">
            {TICKET_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => change(s as TicketStatus)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
              >
                <StatusBadge status={s} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
