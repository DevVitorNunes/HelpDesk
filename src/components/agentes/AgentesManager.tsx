"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { AgenteForm } from "@/components/agentes/AgenteForm";
import { AgenteTable } from "@/components/agentes/AgenteTable";
import { createAgente, updateAgente } from "@/lib/actions/agentes.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { LIST_PAGE_SIZE } from "@/lib/constants/pagination";
import type { Agente } from "@/types/app.types";

interface AgentesManagerProps {
  agentes: Agente[];
}

function matchesAgenteSearch(a: Agente, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    a.nome.toLowerCase().includes(s) ||
    a.email.toLowerCase().includes(s) ||
    (a.telefone ?? "").toLowerCase().includes(s)
  );
}

export function AgentesManager({ agentes }: AgentesManagerProps) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editingAgente, setEditingAgente] = useState<Agente | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredAgentes = useMemo(
    () => agentes.filter((a) => matchesAgenteSearch(a, search)),
    [agentes, search]
  );

  const totalPages = useMemo(
    () =>
      filteredAgentes.length === 0
        ? 0
        : Math.ceil(filteredAgentes.length / LIST_PAGE_SIZE),
    [filteredAgentes.length]
  );

  const paginatedAgentes = useMemo(() => {
    const start = (page - 1) * LIST_PAGE_SIZE;
    return filteredAgentes.slice(start, start + LIST_PAGE_SIZE);
  }, [filteredAgentes, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  function handleSuccess() {
    setOpenCreate(false);
    setEditingAgente(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Agentes</h2>
          <p className="text-sm text-gray-500">
            {search.trim()
              ? `${filteredAgentes.length} de ${agentes.length} agente${agentes.length !== 1 ? "s" : ""} encontrado${filteredAgentes.length !== 1 ? "s" : ""}`
              : `${agentes.length} agente${agentes.length !== 1 ? "s" : ""} ativo${agentes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4" />
          Novo agente
        </Button>
      </div>

      <Input
        placeholder="Buscar por nome, e-mail ou telefone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Buscar agentes"
      />

      <AgenteTable
        agentes={paginatedAgentes}
        onEdit={setEditingAgente}
        onNew={() => setOpenCreate(true)}
      />

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Novo agente"
      >
        <AgenteForm
          action={createAgente}
          onSuccess={handleSuccess}
          onCancel={() => setOpenCreate(false)}
        />
      </Modal>

      <Modal
        open={!!editingAgente}
        onClose={() => setEditingAgente(null)}
        title="Editar agente"
      >
        {editingAgente && (
          <AgenteForm
            key={editingAgente.id}
            agente={editingAgente}
            action={updateAgente.bind(null, editingAgente.id)}
            onSuccess={handleSuccess}
            onCancel={() => setEditingAgente(null)}
          />
        )}
      </Modal>
    </>
  );
}
