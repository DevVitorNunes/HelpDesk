"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Agente } from "@/types/app.types";

type State = { error?: Record<string, string[]>; success?: boolean } | undefined;

interface AgenteFormProps {
  agente?: Agente;
  action: (state: State, formData: FormData) => Promise<State>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export function AgenteForm({ agente, action, onSuccess, onCancel }: AgenteFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [phone, setPhone] = useState(agente?.telefone ?? "");
  const errors = state?.error;

  useEffect(() => {
    if (state?.success) {
      toast.success(agente ? "Agente atualizado com sucesso!" : "Agente criado com sucesso!");
      onSuccess?.();
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Nome"
        name="nome"
        defaultValue={agente?.nome}
        placeholder="Nome completo"
        required
        error={errors?.nome?.[0]}
      />
      <Input
        label="E-mail"
        name="email"
        type="email"
        defaultValue={agente?.email}
        placeholder="email@exemplo.com"
        required
        error={errors?.email?.[0]}
      />
      <Input
        label="Telefone"
        name="telefone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        placeholder="(00) 00000-0000"
        error={errors?.telefone?.[0]}
      />

      {!agente && (
        <Input
          label="Senha inicial"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          required
          error={errors?.password?.[0]}
        />
      )}

      {errors?._root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors._root[0]}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {agente ? "Salvar alterações" : "Criar agente"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel ?? (() => history.back())}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
