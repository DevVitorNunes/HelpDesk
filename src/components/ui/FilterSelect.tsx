"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  emptyLabel?: string;
  label?: string;
  "aria-label": string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  emptyLabel = "Todos",
  label,
  "aria-label": ariaLabel,
  className,
}: FilterSelectProps) {
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-field-label`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const allOptions: FilterSelectOption[] = [
    { value: "", label: emptyLabel },
    ...options,
  ];

  const selectedLabel =
    allOptions.find((o) => o.value === value)?.label ?? emptyLabel;

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label
          id={labelId}
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={label ? undefined : ariaLabel}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2 text-left text-sm text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-gray-500 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={label ? labelId : id}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-white py-1 shadow-lg"
          >
            {allOptions.map((opt) => (
              <li key={opt.value === "" ? "__empty" : opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === opt.value}
                  onClick={() => pick(opt.value)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm text-gray-900",
                    "hover:bg-primary-light focus:bg-primary-light focus:outline-none",
                    value === opt.value && "bg-primary-light/80 font-medium"
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
