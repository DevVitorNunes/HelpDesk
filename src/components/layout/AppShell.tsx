"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { Notification, UserRole } from "@/types/app.types";

// z-index: Header z-10 · dropdowns z-20 · overlay z-30 · drawer z-40 · modais z-50

interface AppShellProps {
  role: UserRole;
  userId: string;
  userName: string;
  companyId: string;
  initialNotifications: Notification[];
  children: ReactNode;
}

export function AppShell({
  role,
  userId,
  userName,
  companyId,
  initialNotifications,
  children,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen) setIsSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onLinkClick={closeSidebar}
        onClose={closeSidebar}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userId={userId}
          companyId={companyId}
          userName={userName}
          notifications={initialNotifications}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto bg-bg p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
