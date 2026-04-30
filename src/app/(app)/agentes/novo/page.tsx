import { AgenteForm } from "@/components/agentes/AgenteForm";
import { createAgente } from "@/lib/actions/agentes.actions";

export default function NovoAgentePage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Novo agente</h2>
        <p className="text-sm text-gray-500">
          Um e-mail de acesso será criado para o agente.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-white p-6">
        <AgenteForm action={createAgente} />
      </div>
    </div>
  );
}
