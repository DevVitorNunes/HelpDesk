"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/Input";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [isOpen, setIsOpen] = useState(false);

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

  const activeCount = FILTER_KEYS.reduce((acc, k) => {
    const v = params.get(k);
    return acc + (v != null && v !== "" ? 1 : 0);
  }, 0);
  const hasFilters = activeCount > 0;

  return (
    <div className="rounded-xl border border-border bg-white p-3 sm:p-4">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-orange-700">
              {activeCount} ativo{activeCount > 1 ? "s" : ""}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          !isOpen ? "hidden md:grid" : "mt-3 md:mt-0"
        )}
      >
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
            className="w-full justify-start gap-1.5 sm:w-auto sm:self-end sm:justify-center"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
