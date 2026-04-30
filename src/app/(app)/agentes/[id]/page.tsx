import { notFound } from "next/navigation";
import { getAgenteById } from "@/lib/queries/agentes.queries";
import { AgenteForm } from "@/components/agentes/AgenteForm";
import { updateAgente } from "@/lib/actions/agentes.actions";

export default async function EditAgentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agente = await getAgenteById(id);

  if (!agente) notFound();

  const action = updateAgente.bind(null, id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Editar agente</h2>
        <p className="text-sm text-gray-500">{agente.nome}</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-6">
        <AgenteForm agente={agente} action={action} />
      </div>
    </div>
  );
}
