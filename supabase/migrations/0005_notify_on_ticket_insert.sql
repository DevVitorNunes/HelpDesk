-- Fix: send ticket_atribuido notification when a ticket is created with an agent already assigned.
-- The existing tickets_notify_trigger only fires AFTER UPDATE, so INSERT with agente_id was silent.

CREATE OR REPLACE FUNCTION public.notify_on_ticket_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  agente_user_id uuid;
BEGIN
  IF NEW.agente_id IS NOT NULL THEN
    SELECT user_id INTO agente_user_id FROM public.agentes WHERE id = NEW.agente_id;
  END IF;

  IF agente_user_id IS NOT NULL THEN
    INSERT INTO public.notifications(usuario_id, tipo, titulo, ticket_id, company_id)
    VALUES (agente_user_id, 'ticket_atribuido', 'Ticket atribuído a você', NEW.id, NEW.company_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER tickets_notify_insert_trigger
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_ticket_insert();
