-- ============================================================
-- HelpDesk — Multi-Tenant Migration
-- ============================================================

-- ── 1. Tabela empresas ───────────────────────────────────────
CREATE TABLE public.empresas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL,
  email      text NOT NULL,
  telefone   text,
  cnpj       text UNIQUE NOT NULL,
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- ── 2. Adicionar company_id nas tabelas (nullable primeiro) ──
-- Nullable para não quebrar dados existentes; setar NOT NULL
-- apenas após rodar data migration em produção.

ALTER TABLE public.users
  ADD COLUMN company_id uuid REFERENCES public.empresas(id);

ALTER TABLE public.agentes
  ADD COLUMN company_id uuid REFERENCES public.empresas(id);

ALTER TABLE public.clients
  ADD COLUMN company_id uuid REFERENCES public.empresas(id);

ALTER TABLE public.tickets
  ADD COLUMN company_id uuid REFERENCES public.empresas(id);

ALTER TABLE public.comments
  ADD COLUMN company_id uuid REFERENCES public.empresas(id);

ALTER TABLE public.attachments
  ADD COLUMN company_id uuid REFERENCES public.empresas(id);

ALTER TABLE public.notifications
  ADD COLUMN company_id uuid REFERENCES public.empresas(id);

-- ticket_history: isolamento via join — sem coluna company_id

-- Índices de performance
CREATE INDEX users_company_idx         ON public.users(company_id);
CREATE INDEX agentes_company_idx       ON public.agentes(company_id);
CREATE INDEX clients_company_idx       ON public.clients(company_id);
CREATE INDEX tickets_company_idx       ON public.tickets(company_id);
CREATE INDEX comments_company_idx      ON public.comments(company_id);
CREATE INDEX attachments_company_idx   ON public.attachments(company_id);
CREATE INDEX notifications_company_idx ON public.notifications(company_id);

-- ── 3. Helper function para RLS ──────────────────────────────
-- STABLE: Postgres faz cache do resultado dentro do mesmo plano
-- SECURITY DEFINER: bypass de RLS ao ler a tabela users
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$;

-- ── 4. Policy da tabela empresas (após users.company_id existir) ──
-- Usa get_user_company_id() para evitar subquery direta
CREATE POLICY "empresas: read own" ON public.empresas
  FOR SELECT TO authenticated
  USING (id = public.get_user_company_id());

-- ── 5. Recriar policies com filtro por empresa ───────────────

-- users
DROP POLICY IF EXISTS "users: authenticated can read all" ON public.users;
DROP POLICY IF EXISTS "users: own row update" ON public.users;
DROP POLICY IF EXISTS "users: admin full" ON public.users;

CREATE POLICY "users: read same company" ON public.users
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "users: own row update" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid() AND company_id = public.get_user_company_id());

CREATE POLICY "users: admin full" ON public.users
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin' AND company_id = public.get_user_company_id());

-- agentes
DROP POLICY IF EXISTS "agentes: authenticated read" ON public.agentes;
DROP POLICY IF EXISTS "agentes: admin all" ON public.agentes;
DROP POLICY IF EXISTS "agentes: agente insert" ON public.agentes;
DROP POLICY IF EXISTS "agentes: agente update" ON public.agentes;

CREATE POLICY "agentes: read same company" ON public.agentes
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "agentes: admin all" ON public.agentes
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin' AND company_id = public.get_user_company_id());

CREATE POLICY "agentes: agente insert" ON public.agentes
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'agente' AND company_id = public.get_user_company_id());

CREATE POLICY "agentes: agente update" ON public.agentes
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'agente' AND company_id = public.get_user_company_id());

-- clients
DROP POLICY IF EXISTS "clients: authenticated read" ON public.clients;
DROP POLICY IF EXISTS "clients: admin all" ON public.clients;
DROP POLICY IF EXISTS "clients: agente insert" ON public.clients;
DROP POLICY IF EXISTS "clients: agente update" ON public.clients;

CREATE POLICY "clients: read same company" ON public.clients
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "clients: admin all" ON public.clients
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin' AND company_id = public.get_user_company_id());

CREATE POLICY "clients: agente insert" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'agente' AND company_id = public.get_user_company_id());

CREATE POLICY "clients: agente update" ON public.clients
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'agente' AND company_id = public.get_user_company_id());

-- tickets
DROP POLICY IF EXISTS "tickets: authenticated read" ON public.tickets;
DROP POLICY IF EXISTS "tickets: admin all" ON public.tickets;
DROP POLICY IF EXISTS "tickets: agente insert" ON public.tickets;
DROP POLICY IF EXISTS "tickets: agente update" ON public.tickets;

CREATE POLICY "tickets: read same company" ON public.tickets
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id() AND deletado = false);

CREATE POLICY "tickets: admin all" ON public.tickets
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin' AND company_id = public.get_user_company_id());

CREATE POLICY "tickets: agente insert" ON public.tickets
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'agente' AND company_id = public.get_user_company_id());

CREATE POLICY "tickets: agente update" ON public.tickets
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'agente' AND company_id = public.get_user_company_id() AND deletado = false);

-- comments
DROP POLICY IF EXISTS "comments: authenticated read" ON public.comments;
DROP POLICY IF EXISTS "comments: insert own" ON public.comments;
DROP POLICY IF EXISTS "comments: admin all" ON public.comments;

CREATE POLICY "comments: read same company" ON public.comments
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "comments: insert own" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND company_id = public.get_user_company_id());

CREATE POLICY "comments: admin all" ON public.comments
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin' AND company_id = public.get_user_company_id());

-- ticket_history (via join — sem company_id direto)
DROP POLICY IF EXISTS "history: authenticated read" ON public.ticket_history;

CREATE POLICY "history: read same company" ON public.ticket_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id
        AND t.company_id = public.get_user_company_id()
    )
  );

-- attachments
DROP POLICY IF EXISTS "attachments: authenticated read" ON public.attachments;
DROP POLICY IF EXISTS "attachments: insert own" ON public.attachments;
DROP POLICY IF EXISTS "attachments: admin all" ON public.attachments;

CREATE POLICY "attachments: read same company" ON public.attachments
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "attachments: insert own" ON public.attachments
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND company_id = public.get_user_company_id());

CREATE POLICY "attachments: admin all" ON public.attachments
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin' AND company_id = public.get_user_company_id());

-- notifications
DROP POLICY IF EXISTS "notifications: own" ON public.notifications;

CREATE POLICY "notifications: own same company" ON public.notifications
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid() AND company_id = public.get_user_company_id());

-- ── 6. Atualizar trigger handle_new_user ─────────────────────
-- Aceita company_id do user_metadata para criação via service role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, company_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'role', 'agente'),
    (NEW.raw_user_meta_data->>'company_id')::uuid
  )
  ON CONFLICT (id) DO UPDATE
    SET company_id = EXCLUDED.company_id
    WHERE public.users.company_id IS NULL;
  RETURN NEW;
END;
$$;
