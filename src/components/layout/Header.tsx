"use client";

import { usePathname } from "next/navigation";
import { LogOut, Menu, User } from "lucide-react";
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
  onToggleSidebar?: () => void;
}

export function Header({
  userId,
  companyId,
  userName,
  notifications,
  onToggleSidebar,
}: HeaderProps) {
  const pathname = usePathname();

  const title = routeLabels[pathname] ?? "HelpDesk";

  return (
    <header className="relative z-10 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="-ml-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-semibold text-gray-900 md:text-lg">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationBell
          userId={userId}
          companyId={companyId}
          initialNotifications={notifications}
        />

        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 sm:px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light">
            <User className="h-4 w-4 text-orange-600" />
          </div>
          <span className="hidden max-w-[8rem] truncate text-sm font-medium text-gray-700 sm:inline md:max-w-[12rem]">
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
