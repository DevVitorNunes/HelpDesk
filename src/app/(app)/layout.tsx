import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/queries/notifications.queries";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import type { AppUser, UserRole } from "@/types/app.types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single() as unknown as { data: AppUser | null };

  if (!profile) redirect("/login");
  if (!profile.company_id) redirect("/login");

  const notifications = await getNotifications(profile.id);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={profile.role as UserRole} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userId={profile.id}
          companyId={profile.company_id}
          userName={profile.name}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto bg-bg p-6">{children}</main>
      </div>
    </div>
  );
}
