"use client";

import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { signOut } from "@/lib/actions/auth.actions";
import type { Notification } from "@/types/app.types";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/tickets": "Tickets",
  "/clientes": "Clientes",
  "/clientes/novo": "Novo Cliente",
  "/agentes": "Agentes",
  "/agentes/novo": "Novo Agente",
};

interface HeaderProps {
  userId: string;
  companyId: string;
  userName: string;
  notifications: Notification[];
}

export function Header({ userId, companyId, userName, notifications }: HeaderProps) {
  const pathname = usePathname();

  const title = routeLabels[pathname] ?? "HelpDesk";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-2">
        <NotificationBell userId={userId} companyId={companyId} initialNotifications={notifications} />

        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light">
            <User className="h-4 w-4 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
            {userName}
          </span>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
