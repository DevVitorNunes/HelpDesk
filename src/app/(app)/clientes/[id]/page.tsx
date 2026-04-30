import { notFound } from "next/navigation";
import { getClienteById } from "@/lib/queries/clientes.queries";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { updateCliente } from "@/lib/actions/clientes.actions";

export default async function EditClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await getClienteById(id);

  if (!cliente) notFound();

  const action = updateCliente.bind(null, id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Editar cliente</h2>
        <p className="text-sm text-gray-500">{cliente.name}</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-6">
        <ClienteForm cliente={cliente} action={action} />
      </div>
    </div>
  );
}
