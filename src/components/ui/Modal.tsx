"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Modal({ open, onClose, title, children, className, contentClassName }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
          "relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]",
          className
        )}
      >
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
        <div className={cn("p-6 overflow-y-auto", contentClassName)}>{children}</div>
      </div>
    </div>
  );
}
