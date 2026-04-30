"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { ClienteTable } from "@/components/clientes/ClienteTable";
import { createCliente, updateCliente } from "@/lib/actions/clientes.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { LIST_PAGE_SIZE } from "@/lib/constants/pagination";
import type { Client } from "@/types/app.types";

interface ClientesManagerProps {
  clientes: Client[];
  isAdmin: boolean;
}

function matchesClienteSearch(c: Client, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    c.name.toLowerCase().includes(s) ||
    c.email.toLowerCase().includes(s) ||
    (c.phone ?? "").toLowerCase().includes(s)
  );
}

export function ClientesManager({ clientes, isAdmin }: ClientesManagerProps) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredClientes = useMemo(
    () => clientes.filter((c) => matchesClienteSearch(c, search)),
    [clientes, search]
  );

  const totalPages = useMemo(
    () =>
      filteredClientes.length === 0
        ? 0
        : Math.ceil(filteredClientes.length / LIST_PAGE_SIZE),
    [filteredClientes.length]
  );

  const paginatedClientes = useMemo(() => {
    const start = (page - 1) * LIST_PAGE_SIZE;
    return filteredClientes.slice(start, start + LIST_PAGE_SIZE);
  }, [filteredClientes, page]);

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
    setEditingCliente(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Clientes</h2>
          <p className="text-sm text-gray-500">
            {search.trim()
              ? `${filteredClientes.length} de ${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} encontrado${filteredClientes.length !== 1 ? "s" : ""}`
              : `${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} cadastrado${clientes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar por nome, e-mail ou telefone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Buscar clientes"
      />

      <ClienteTable
        clientes={paginatedClientes}
        isAdmin={isAdmin}
        onEdit={setEditingCliente}
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
        title="Novo cliente"
      >
        <ClienteForm
          action={createCliente}
          onSuccess={handleSuccess}
          onCancel={() => setOpenCreate(false)}
        />
      </Modal>

      <Modal
        open={!!editingCliente}
        onClose={() => setEditingCliente(null)}
        title="Editar cliente"
      >
        {editingCliente && (
          <ClienteForm
            key={editingCliente.id}
            cliente={editingCliente}
            action={updateCliente.bind(null, editingCliente.id)}
            onSuccess={handleSuccess}
            onCancel={() => setEditingCliente(null)}
          />
        )}
      </Modal>
    </>
  );
}
