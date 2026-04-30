export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TicketStatus = "Aberto" | "Em progresso" | "Resolvido" | "Fechado";
export type TicketPriority = "Baixa" | "Média" | "Alta" | "Urgente";
export type UserRole = "admin" | "agente";
export type NotificationType =
  | "ticket_atribuido"
  | "status_alterado"
  | "novo_comentario";

export type Database = {
  public: {
    PostgrestVersion: "12";
    Tables: {
      empresas: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          cnpj: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone?: string | null;
          cnpj: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          cnpj?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          profile_photo: string | null;
          company_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: UserRole;
          profile_photo?: string | null;
          company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: UserRole;
          profile_photo?: string | null;
          company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agentes: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          user_id: string | null;
          company_id: string | null;
          deletado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone?: string | null;
          user_id?: string | null;
          company_id?: string | null;
          deletado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          user_id?: string | null;
          company_id?: string | null;
          deletado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          user_id: string | null;
          company_id: string | null;
          deletado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          user_id?: string | null;
          company_id?: string | null;
          deletado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          user_id?: string | null;
          company_id?: string | null;
          deletado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: TicketStatus;
          priority: TicketPriority;
          agente_id: string | null;
          client_id: string;
          user_id: string;
          company_id: string | null;
          deletado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          agente_id?: string | null;
          client_id: string;
          user_id: string;
          company_id?: string | null;
          deletado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          agente_id?: string | null;
          client_id?: string;
          user_id?: string;
          company_id?: string | null;
          deletado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          body: string;
          author_id: string;
          ticket_id: string;
          company_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          body: string;
          author_id: string;
          ticket_id: string;
          company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          body?: string;
          author_id?: string;
          ticket_id?: string;
          company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ticket_history: {
        Row: {
          id: string;
          ticket_id: string;
          campo: string;
          valor_anterior: string | null;
          valor_novo: string | null;
          usuario_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          campo: string;
          valor_anterior?: string | null;
          valor_novo?: string | null;
          usuario_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          campo?: string;
          valor_anterior?: string | null;
          valor_novo?: string | null;
          usuario_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      attachments: {
        Row: {
          id: string;
          ticket_id: string;
          nome_arquivo: string;
          url: string;
          tamanho_bytes: number | null;
          uploaded_by: string;
          company_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          nome_arquivo: string;
          url: string;
          tamanho_bytes?: number | null;
          uploaded_by: string;
          company_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          nome_arquivo?: string;
          url?: string;
          tamanho_bytes?: number | null;
          uploaded_by?: string;
          company_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: NotificationType;
          titulo: string;
          mensagem: string | null;
          ticket_id: string | null;
          company_id: string | null;
          lida: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          tipo: NotificationType;
          titulo: string;
          mensagem?: string | null;
          ticket_id?: string | null;
          company_id?: string | null;
          lida?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          tipo?: NotificationType;
          titulo?: string;
          mensagem?: string | null;
          ticket_id?: string | null;
          company_id?: string | null;
          lida?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_user_company_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
