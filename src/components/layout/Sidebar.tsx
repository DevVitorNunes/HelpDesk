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
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const items = navItems.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  return (
    <aside className="flex h-full w-60 flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Headphones className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-white">HelpDesk</span>
      </div>

      {/* Navigation */}
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
