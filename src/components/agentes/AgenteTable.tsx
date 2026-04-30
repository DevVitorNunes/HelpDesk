"use client";

import { Pencil, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { deleteAgente } from "@/lib/actions/agentes.actions";
import { formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import type { Agente } from "@/types/app.types";

interface AgenteTableProps {
  agentes: Agente[];
  onEdit?: (agente: Agente) => void;
  onNew?: () => void;
}

export function AgenteTable({ agentes, onEdit, onNew }: AgenteTableProps) {
  const router = useRouter();

  if (agentes.length === 0) {
    return (
      <EmptyState
        icon={<UserCog className="h-12 w-12" />}
        title="Nenhum agente cadastrado"
        description="Cadastre o primeiro agente para começar."
        action={
          <Button onClick={onNew}>Novo agente</Button>
        }
      />
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este agente?")) return;
    const result = await deleteAgente(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Agente removido com sucesso!");
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
          {agentes.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{a.nome}</td>
              <td className="px-4 py-3 text-gray-600">{a.email}</td>
              <td className="px-4 py-3 text-gray-600">{a.telefone ?? "—"}</td>
              <td className="px-4 py-3 text-gray-500">
                {formatDateShort(a.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit?.(a)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
