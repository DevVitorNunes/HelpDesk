"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Ticket } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/app.types";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications.actions";
import { useRouter } from "next/navigation";

interface NotificationBellProps {
  userId: string;
  companyId: string;
  initialNotifications: Notification[];
}

export function NotificationBell({
  userId,
  companyId,
  initialNotifications,
}: NotificationBellProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = notifications.filter((n) => !n.lida).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Realtime subscription
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `usuario_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as Notification;
          if (n.company_id !== companyId) return;
          setNotifications((prev) => [n, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, companyId]);

  async function handleMarkAllRead() {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  async function handleClick(notification: Notification) {
    if (!notification.lida) {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, lida: true } : n))
      );
    }
    if (notification.ticket_id) {
      router.push("/tickets");
    }
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[calc(100vw-1rem)] max-w-sm rounded-xl border border-border bg-white shadow-lg sm:w-80">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                Notificações
              </span>
              {unread > 0 && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-orange-700">
                  {unread} nova{unread > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center text-sm text-gray-400">
                <CheckCheck className="mb-2 h-8 w-8 text-gray-200" />
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50",
                    !n.lida && "bg-orange-50"
                  )}
                >
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-light">
                    <Ticket className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {n.titulo}
                    </p>
                    {n.mensagem && (
                      <p className="mt-0.5 text-xs text-gray-500 truncate">
                        {n.mensagem}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {formatRelative(n.created_at)}
                    </p>
                  </div>
                  {!n.lida && (
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
