-- Fix: populate company_id in notifications inserted by triggers.
-- After 0002_multi_tenant.sql, the RLS policy requires company_id = get_user_company_id(),
-- but the trigger functions were never updated to set it. This migration rewrites both
-- functions and backfills existing rows.

CREATE OR REPLACE FUNCTION public.notify_on_ticket_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  agente_user_id uuid;
BEGIN
  IF NEW.agente_id IS NOT NULL THEN
    SELECT user_id INTO agente_user_id FROM public.agentes WHERE id = NEW.agente_id;
  END IF;

  IF OLD.agente_id IS DISTINCT FROM NEW.agente_id AND agente_user_id IS NOT NULL THEN
    INSERT INTO public.notifications(usuario_id, tipo, titulo, ticket_id, company_id)
    VALUES (agente_user_id, 'ticket_atribuido', 'Ticket atribuído a você', NEW.id, NEW.company_id);
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status AND agente_user_id IS NOT NULL THEN
    INSERT INTO public.notifications(usuario_id, tipo, titulo, mensagem, ticket_id, company_id)
    VALUES (
      agente_user_id,
      'status_alterado',
      'Status do ticket alterado',
      'Status alterado de "' || OLD.status || '" para "' || NEW.status || '"',
      NEW.id,
      NEW.company_id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  agente_user_id   uuid;
  ticket_agente_id uuid;
  ticket_company_id uuid;
BEGIN
  SELECT agente_id, company_id
    INTO ticket_agente_id, ticket_company_id
    FROM public.tickets
   WHERE id = NEW.ticket_id;

  IF ticket_agente_id IS NOT NULL THEN
    SELECT user_id INTO agente_user_id FROM public.agentes WHERE id = ticket_agente_id;
  END IF;

  IF agente_user_id IS NOT NULL AND agente_user_id <> NEW.author_id THEN
    INSERT INTO public.notifications(usuario_id, tipo, titulo, ticket_id, company_id)
    VALUES (agente_user_id, 'novo_comentario', 'Novo comentário no seu ticket', NEW.ticket_id, ticket_company_id);
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill existing notifications that have a ticket_id but no company_id.
UPDATE public.notifications n
   SET company_id = t.company_id
  FROM public.tickets t
 WHERE n.company_id IS NULL
   AND n.ticket_id IS NOT NULL
   AND n.ticket_id = t.id;
