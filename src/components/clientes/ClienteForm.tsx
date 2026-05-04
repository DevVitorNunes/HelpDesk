"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Client } from "@/types/app.types";

type State = { error?: Record<string, string[]>; success?: boolean } | undefined;

interface ClienteFormProps {
  cliente?: Client;
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

export function ClienteForm({ cliente, action, onSuccess, onCancel }: ClienteFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [phone, setPhone] = useState(cliente?.phone ?? "");
  const errors = state?.error;

  useEffect(() => {
    if (state?.success) {
      toast.success(cliente ? "Cliente atualizado com sucesso!" : "Cliente criado com sucesso!");
      onSuccess?.();
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Nome"
        name="name"
        defaultValue={cliente?.name}
        placeholder="Nome do cliente"
        required
        error={errors?.name?.[0]}
      />
      <Input
        label="E-mail"
        name="email"
        type="email"
        defaultValue={cliente?.email}
        placeholder="email@exemplo.com"
        required
        error={errors?.email?.[0]}
      />
      <Input
        label="Telefone"
        name="phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        placeholder="(00) 00000-0000"
        error={errors?.phone?.[0]}
      />

      {errors?._root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors._root[0]}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:gap-3">
        <Button type="submit" loading={pending} className="w-full sm:w-auto">
          {cliente ? "Salvar alterações" : "Criar cliente"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel ?? (() => history.back())}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
