"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/types/app.types";
import type { Agente, Client, TicketWithRelations } from "@/types/app.types";

type State = { error?: Record<string, string[]>; success?: boolean; redirectTo?: string } | undefined;

interface TicketFormProps {
  ticket?: TicketWithRelations;
  agentes: Pick<Agente, "id" | "nome">[];
  clientes: Pick<Client, "id" | "name">[];
  action: (state: State, formData: FormData) => Promise<State>;
  showStatus?: boolean;
  onSuccess?: (redirectTo?: string) => void;
  onCancel?: () => void;
}

export function TicketForm({
  ticket,
  agentes,
  clientes,
  action,
  showStatus = false,
  onSuccess,
  onCancel,
}: TicketFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state?.error;

  useEffect(() => {
    if (state?.success) {
      toast.success(ticket ? "Ticket atualizado com sucesso!" : "Ticket criado com sucesso!");
      if (onSuccess) {
        onSuccess(state.redirectTo);
      } else if (state.redirectTo) {
        router.push(state.redirectTo);
      }
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Título"
        name="title"
        defaultValue={ticket?.title}
        placeholder="Descreva o problema brevemente"
        required
        error={errors?.title?.[0]}
      />

      <Textarea
        label="Descrição"
        name="description"
        defaultValue={ticket?.description}
        placeholder="Descreva o problema com detalhes..."
        rows={5}
        required
        error={errors?.description?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Cliente"
          name="client_id"
          defaultValue={ticket?.client_id ?? ""}
          placeholder="Selecione um cliente"
          options={clientes.map((c) => ({ value: c.id, label: c.name }))}
          required
          error={errors?.client_id?.[0]}
        />

        <Select
          label="Prioridade"
          name="priority"
          defaultValue={ticket?.priority ?? "Média"}
          options={TICKET_PRIORITIES.map((p) => ({ value: p, label: p }))}
          error={errors?.priority?.[0]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Agente responsável"
          name="agente_id"
          defaultValue={ticket?.agente_id ?? ""}
          placeholder="Não atribuído"
          options={agentes.map((a) => ({ value: a.id, label: a.nome }))}
          error={errors?.agente_id?.[0]}
        />

        {showStatus && (
          <Select
            label="Status"
            name="status"
            defaultValue={ticket?.status ?? "Aberto"}
            options={TICKET_STATUSES.map((s) => ({ value: s, label: s }))}
            error={errors?.status?.[0]}
          />
        )}
      </div>

      {errors?._root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors._root[0]}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {ticket ? "Salvar alterações" : "Criar ticket"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel ?? (() => history.back())}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
