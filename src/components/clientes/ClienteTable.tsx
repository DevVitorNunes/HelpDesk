"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteCliente } from "@/lib/actions/clientes.actions";
import { formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import type { Client } from "@/types/app.types";

interface ClienteTableProps {
  clientes: Client[];
  isAdmin: boolean;
  onEdit?: (cliente: Client) => void;
  onNew?: () => void;
}

export function ClienteTable({ clientes, isAdmin, onEdit, onNew }: ClienteTableProps) {
  const router = useRouter();

  if (clientes.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="Nenhum cliente cadastrado"
        description="Cadastre o primeiro cliente para começar."
        action={
          <Button onClick={onNew}>Novo cliente</Button>
        }
      />
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este cliente?")) return;
    const result = await deleteCliente(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Cliente removido com sucesso!");
      router.refresh();
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Telefone</th>
            <th className="px-4 py-3">Cadastrado em</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {clientes.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
              <td className="px-4 py-3 text-gray-600">{c.email}</td>
              <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
              <td className="px-4 py-3 text-gray-500">
                {formatDateShort(c.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit?.(c)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
