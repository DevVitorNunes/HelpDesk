import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/queries/notifications.queries";
import { AppShell } from "@/components/layout/AppShell";
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
    <AppShell
      role={profile.role as UserRole}
      userId={profile.id}
      userName={profile.name}
      companyId={profile.company_id}
      initialNotifications={notifications}
    >
      {children}
    </AppShell>
  );
}
