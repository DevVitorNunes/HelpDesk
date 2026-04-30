import { ClienteForm } from "@/components/clientes/ClienteForm";
import { createCliente } from "@/lib/actions/clientes.actions";

export default function NovoClientePage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Novo cliente</h2>
        <p className="text-sm text-gray-500">Preencha os dados do cliente.</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-6">
        <ClienteForm action={createCliente} />
      </div>
    </div>
  );
}
