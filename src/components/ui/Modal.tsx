"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Modal({ open, onClose, title, children, className, contentClassName }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-xl transition-transform duration-200 sm:max-w-lg sm:rounded-xl sm:translate-y-0",
          mounted ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        <div className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden" aria-hidden />
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className={cn("p-4 sm:p-6 overflow-y-auto", contentClassName)}>{children}</div>
      </div>
    </div>
  );
}
