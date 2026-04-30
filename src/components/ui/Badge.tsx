import { cn } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "@/types/app.types";

const statusStyles: Record<TicketStatus, string> = {
  Aberto: "bg-blue-100 text-blue-700",
  "Em progresso": "bg-amber-100 text-amber-700",
  Resolvido: "bg-green-100 text-green-700",
  Fechado: "bg-gray-100 text-gray-700",
};

const priorityStyles: Record<TicketPriority, string> = {
  Baixa: "bg-green-100 text-green-700",
  Média: "bg-amber-100 text-amber-700",
  Alta: "bg-orange-100 text-orange-700",
  Urgente: "bg-red-100 text-red-700",
};

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        priorityStyles[priority],
        className
      )}
    >
      {priority}
    </span>
  );
}
