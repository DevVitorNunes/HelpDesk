import { z } from "zod";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/types/app.types";

export const TicketSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  description: z.string().min(1, "Descrição é obrigatória"),
  client_id: z.string().uuid("Selecione um cliente"),
  priority: z.enum(TICKET_PRIORITIES as [string, ...string[]], {
    errorMap: () => ({ message: "Selecione uma prioridade" }),
  }),
  agente_id: z.string().uuid().optional().nullable(),
  status: z
    .enum(TICKET_STATUSES as [string, ...string[]])
    .optional()
    .default("Aberto"),
});

export type TicketFormValues = z.infer<typeof TicketSchema>;
