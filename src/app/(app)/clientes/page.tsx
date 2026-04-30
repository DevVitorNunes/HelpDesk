import { getClientes } from "@/lib/queries/clientes.queries";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ClientesManager } from "@/components/clientes/ClientesManager";
import type { AppUser } from "@/types/app.types";

export default async function ClientesPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [clientes, profileResult] = await Promise.all([
    getClientes(),
    supabase.from("users").select("*").eq("id", user!.id).single() as unknown as Promise<{ data: AppUser | null }>,
  ]);

  const isAdmin = profileResult.data?.role === "admin";

  return (
    <div className="flex flex-col gap-5">
      <ClientesManager clientes={clientes} isAdmin={isAdmin} />
    </div>
  );
}
