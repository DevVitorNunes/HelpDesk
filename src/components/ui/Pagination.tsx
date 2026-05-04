"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <>
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        <span className="text-sm text-gray-500">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="hidden items-center gap-1 sm:flex">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {visible.map((p, i) => {
          const prev = visible[i - 1];
          return (
            <Fragment key={p}>
              {prev && p - prev > 1 && (
                <span className="px-1 text-sm text-gray-400">…</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                  p === page
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {p}
              </button>
            </Fragment>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
