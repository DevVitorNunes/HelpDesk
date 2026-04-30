"use client";

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
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <>
            {prev && p - prev > 1 && (
              <span key={`ellipsis-${p}`} className="px-1 text-gray-400 text-sm">
                …
              </span>
            )}
            <button
              key={p}
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
          </>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
