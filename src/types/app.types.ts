import type {
  Database,
  TicketStatus,
  TicketPriority,
  UserRole,
} from "./database.types";

export type { TicketStatus, TicketPriority, UserRole };

export const TICKET_STATUSES: TicketStatus[] = [
  "Aberto",
  "Em progresso",
  "Resolvido",
  "Fechado",
];

export const TICKET_PRIORITIES: TicketPriority[] = [
  "Baixa",
  "Média",
  "Alta",
  "Urgente",
];

export type Empresa = Database["public"]["Tables"]["empresas"]["Row"];
export type AppUser = Database["public"]["Tables"]["users"]["Row"];
export type Agente = Database["public"]["Tables"]["agentes"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type TicketHistory =
  Database["public"]["Tables"]["ticket_history"]["Row"];
export type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type TicketWithRelations = Ticket & {
  agentes: Pick<Agente, "id" | "nome" | "email"> | null;
  clients: Pick<Client, "id" | "name" | "email">;
  users: Pick<AppUser, "id" | "name">;
};

export type TicketDetail = TicketWithRelations & {
  comments: (Comment & { users: Pick<AppUser, "id" | "name"> })[];
  ticket_history: (TicketHistory & {
    users: Pick<AppUser, "id" | "name">;
  })[];
  attachments: (Attachment & { users: Pick<AppUser, "id" | "name"> })[];
};

export type TicketFilters = {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  agente_id?: string;
  client_id?: string;
  /** YYYY-MM-DD — tickets created on this calendar day (Criado em) */
  created_date?: string;
  page?: number;
};
