"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import type { Agente, Client } from "@/types/app.types";
import { TICKET_STATUSES, TICKET_PRIORITIES } from "@/types/app.types";

interface TicketFiltersProps {
  agentes: Pick<Agente, "id" | "nome">[];
  clientes: Pick<Client, "id" | "name">[];
}

const FILTER_KEYS = [
  "search",
  "status",
  "priority",
  "agente_id",
  "client_id",
  "created_date",
] as const;

export function TicketFilters({ agentes, clientes }: TicketFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, params]
  );

  const hasFilters = FILTER_KEYS.some((k) => {
    const v = params.get(k);
    return v != null && v !== "";
  });

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Input
          label="Busca"
          placeholder="Buscar por título..."
          defaultValue={params.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
        />
        <FilterSelect
          label="Status"
          aria-label="Filtrar por status"
          value={params.get("status") ?? ""}
          onChange={(v) => update("status", v)}
          options={TICKET_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <FilterSelect
          label="Prioridade"
          aria-label="Filtrar por prioridade"
          value={params.get("priority") ?? ""}
          onChange={(v) => update("priority", v)}
          options={TICKET_PRIORITIES.map((p) => ({ value: p, label: p }))}
        />
        <FilterSelect
          label="Agente"
          aria-label="Filtrar por agente"
          value={params.get("agente_id") ?? ""}
          onChange={(v) => update("agente_id", v)}
          options={agentes.map((a) => ({ value: a.id, label: a.nome }))}
        />
        <FilterSelect
          label="Cliente"
          aria-label="Filtrar por cliente"
          value={params.get("client_id") ?? ""}
          onChange={(v) => update("client_id", v)}
          options={clientes.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Input
          label="Data de criação"
          id="filter-created-date"
          type="date"
          defaultValue={params.get("created_date") ?? ""}
          onChange={(e) => update("created_date", e.target.value)}
        />
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
            className="self-end gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
