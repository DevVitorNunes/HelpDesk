-- ============================================================
-- HelpDesk — Initial Schema
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE ticket_status AS ENUM (
  'Aberto', 'Em progresso', 'Resolvido', 'Fechado'
);

CREATE TYPE ticket_priority AS ENUM (
  'Baixa', 'Média', 'Alta', 'Urgente'
);

CREATE TYPE notification_type AS ENUM (
  'ticket_atribuido', 'status_alterado', 'novo_comentario'
);

-- ── Helper: auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── Tables ───────────────────────────────────────────────────

-- users mirrors auth.users and adds role + profile
CREATE TABLE public.users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  email         text UNIQUE NOT NULL,
  role          text NOT NULL DEFAULT 'agente' CHECK (role IN ('admin', 'agente')),
  profile_photo text,
  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- agentes
CREATE TABLE public.agentes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL,
  email      text NOT NULL,
  telefone   text,
  user_id    uuid REFERENCES public.users(id) ON DELETE SET NULL,
  deletado   boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER agentes_updated_at
  BEFORE UPDATE ON public.agentes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- clients
CREATE TABLE public.clients (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  user_id    uuid REFERENCES public.users(id) ON DELETE SET NULL,
  deletado   boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- tickets
CREATE TABLE public.tickets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text NOT NULL,
  status      ticket_status NOT NULL DEFAULT 'Aberto',
  priority    ticket_priority NOT NULL DEFAULT 'Média',
  agente_id   uuid REFERENCES public.agentes(id) ON DELETE SET NULL,
  client_id   uuid NOT NULL REFERENCES public.clients(id),
  user_id     uuid NOT NULL REFERENCES public.users(id),
  deletado    boolean NOT NULL DEFAULT FALSE,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX tickets_status_idx   ON public.tickets(status);
CREATE INDEX tickets_priority_idx ON public.tickets(priority);
CREATE INDEX tickets_agente_idx   ON public.tickets(agente_id);
CREATE INDEX tickets_client_idx   ON public.tickets(client_id);

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- comments
CREATE TABLE public.comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body       text NOT NULL,
  author_id  uuid NOT NULL REFERENCES public.users(id),
  ticket_id  uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_ticket_idx ON public.comments(ticket_id);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ticket_history
CREATE TABLE public.ticket_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  campo           text NOT NULL,
  valor_anterior  text,
  valor_novo      text,
  usuario_id      uuid NOT NULL REFERENCES public.users(id),
  created_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX history_ticket_idx ON public.ticket_history(ticket_id);

-- attachments
CREATE TABLE public.attachments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id      uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  nome_arquivo   text NOT NULL,
  url            text NOT NULL,
  tamanho_bytes  integer,
  uploaded_by    uuid NOT NULL REFERENCES public.users(id),
  created_at     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX attachments_ticket_idx ON public.attachments(ticket_id);

-- notifications
CREATE TABLE public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipo        notification_type NOT NULL,
  titulo      text NOT NULL,
  mensagem    text,
  ticket_id   uuid REFERENCES public.tickets(id) ON DELETE CASCADE,
  lida        boolean NOT NULL DEFAULT FALSE,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_usuario_idx ON public.notifications(usuario_id);
CREATE INDEX notifications_lida_idx    ON public.notifications(lida);

-- ── Trigger: mirror auth.users → public.users ────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'role', 'agente')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Trigger: ticket_history on ticket UPDATE ─────────────────
CREATE OR REPLACE FUNCTION public.generate_ticket_history()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor_id uuid;
BEGIN
  -- actor is the user_id stored in the ticket (creator/last editor)
  actor_id := NEW.user_id;

  IF OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO public.ticket_history(ticket_id, campo, valor_anterior, valor_novo, usuario_id)
    VALUES (NEW.id, 'title', OLD.title, NEW.title, actor_id);
  END IF;

  IF OLD.description IS DISTINCT FROM NEW.description THEN
    INSERT INTO public.ticket_history(ticket_id, campo, valor_anterior, valor_novo, usuario_id)
    VALUES (NEW.id, 'description', LEFT(OLD.description, 200), LEFT(NEW.description, 200), actor_id);
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ticket_history(ticket_id, campo, valor_anterior, valor_novo, usuario_id)
    VALUES (NEW.id, 'status', OLD.status::text, NEW.status::text, actor_id);
  END IF;

  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO public.ticket_history(ticket_id, campo, valor_anterior, valor_novo, usuario_id)
    VALUES (NEW.id, 'priority', OLD.priority::text, NEW.priority::text, actor_id);
  END IF;

  IF OLD.agente_id IS DISTINCT FROM NEW.agente_id THEN
    INSERT INTO public.ticket_history(ticket_id, campo, valor_anterior, valor_novo, usuario_id)
    VALUES (NEW.id, 'agente_id', OLD.agente_id::text, NEW.agente_id::text, actor_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER tickets_history_trigger
  AFTER UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_history();

-- ── Trigger: notifications on ticket UPDATE ──────────────────
CREATE OR REPLACE FUNCTION public.notify_on_ticket_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  agente_user_id uuid;
BEGIN
  -- Resolve the agente's user_id
  IF NEW.agente_id IS NOT NULL THEN
    SELECT user_id INTO agente_user_id FROM public.agentes WHERE id = NEW.agente_id;
  END IF;

  -- Ticket assigned to a new agente
  IF OLD.agente_id IS DISTINCT FROM NEW.agente_id AND agente_user_id IS NOT NULL THEN
    INSERT INTO public.notifications(usuario_id, tipo, titulo, ticket_id)
    VALUES (agente_user_id, 'ticket_atribuido', 'Ticket atribuído a você', NEW.id);
  END IF;

  -- Status changed
  IF OLD.status IS DISTINCT FROM NEW.status AND agente_user_id IS NOT NULL THEN
    INSERT INTO public.notifications(usuario_id, tipo, titulo, mensagem, ticket_id)
    VALUES (
      agente_user_id,
      'status_alterado',
      'Status do ticket alterado',
      'Status alterado de "' || OLD.status || '" para "' || NEW.status || '"',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER tickets_notify_trigger
  AFTER UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_ticket_update();

-- ── Trigger: notification on comment INSERT ──────────────────
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  agente_user_id uuid;
  ticket_agente_id uuid;
BEGIN
  SELECT agente_id INTO ticket_agente_id FROM public.tickets WHERE id = NEW.ticket_id;

  IF ticket_agente_id IS NOT NULL THEN
    SELECT user_id INTO agente_user_id FROM public.agentes WHERE id = ticket_agente_id;
  END IF;

  IF agente_user_id IS NOT NULL AND agente_user_id <> NEW.author_id THEN
    INSERT INTO public.notifications(usuario_id, tipo, titulo, ticket_id)
    VALUES (agente_user_id, 'novo_comentario', 'Novo comentário no seu ticket', NEW.ticket_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER comments_notify_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- ── Helper function for RLS ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agentes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users: authenticated can read all" ON public.users
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "users: own row update" ON public.users
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "users: admin full" ON public.users
  FOR ALL TO authenticated USING (public.get_user_role() = 'admin');

-- agentes
CREATE POLICY "agentes: authenticated read" ON public.agentes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "agentes: admin all" ON public.agentes
  FOR ALL TO authenticated USING (public.get_user_role() = 'admin');
CREATE POLICY "agentes: agente insert" ON public.agentes
  FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'agente');
CREATE POLICY "agentes: agente update" ON public.agentes
  FOR UPDATE TO authenticated USING (public.get_user_role() = 'agente');

-- clients
CREATE POLICY "clients: authenticated read" ON public.clients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clients: admin all" ON public.clients
  FOR ALL TO authenticated USING (public.get_user_role() = 'admin');
CREATE POLICY "clients: agente insert" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'agente');
CREATE POLICY "clients: agente update" ON public.clients
  FOR UPDATE TO authenticated USING (public.get_user_role() = 'agente');

-- tickets
CREATE POLICY "tickets: authenticated read" ON public.tickets
  FOR SELECT TO authenticated USING (deletado = false);
CREATE POLICY "tickets: admin all" ON public.tickets
  FOR ALL TO authenticated USING (public.get_user_role() = 'admin');
CREATE POLICY "tickets: agente insert" ON public.tickets
  FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'agente');
CREATE POLICY "tickets: agente update" ON public.tickets
  FOR UPDATE TO authenticated USING (public.get_user_role() = 'agente' AND deletado = false);

-- comments
CREATE POLICY "comments: authenticated read" ON public.comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments: insert own" ON public.comments
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "comments: admin all" ON public.comments
  FOR ALL TO authenticated USING (public.get_user_role() = 'admin');

-- ticket_history
CREATE POLICY "history: authenticated read" ON public.ticket_history
  FOR SELECT TO authenticated USING (true);

-- attachments
CREATE POLICY "attachments: authenticated read" ON public.attachments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "attachments: insert own" ON public.attachments
  FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "attachments: admin all" ON public.attachments
  FOR ALL TO authenticated USING (public.get_user_role() = 'admin');

-- notifications
CREATE POLICY "notifications: own" ON public.notifications
  FOR ALL TO authenticated USING (usuario_id = auth.uid());

-- ── Storage bucket ────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,
  10485760,  -- 10 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]
) ON CONFLICT DO NOTHING;

CREATE POLICY "attachments storage: read authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'attachments');
CREATE POLICY "attachments storage: insert authenticated" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "attachments storage: delete own" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]
  );
