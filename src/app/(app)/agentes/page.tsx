import { getAgentes } from "@/lib/queries/agentes.queries";
import { AgentesManager } from "@/components/agentes/AgentesManager";

export default async function AgentesPage() {
  const agentes = await getAgentes();

  return (
    <div className="flex flex-col gap-5">
      <AgentesManager agentes={agentes} />
    </div>
  );
}
