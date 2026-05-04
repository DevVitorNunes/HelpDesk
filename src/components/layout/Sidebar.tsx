"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCog,
  Headphones,
  X,
} from "lucide-react";
import type { UserRole } from "@/types/app.types";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/tickets", label: "Tickets", icon: Ticket, adminOnly: false },
  { href: "/clientes", label: "Clientes", icon: Users, adminOnly: false },
  { href: "/agentes", label: "Agentes", icon: UserCog, adminOnly: true },
];

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onLinkClick?: () => void;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen = false, onLinkClick, onClose }: SidebarProps) {
  const pathname = usePathname();

  const items = navItems.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar transition-transform duration-200",
        "fixed inset-y-0 left-0 z-40 w-72 -translate-x-full",
        isOpen && "translate-x-0",
        "md:static md:z-auto md:w-60 md:translate-x-0"
      )}
      aria-label="Navegação principal"
    >
      <div className="flex h-16 items-center justify-between gap-2.5 border-b border-white/10 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Headphones className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold text-white">HelpDesk</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-sidebar-text hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
