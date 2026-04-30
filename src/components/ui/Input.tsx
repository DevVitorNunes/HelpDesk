import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, rightAdornment, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-gray-900",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
              "disabled:bg-gray-50 disabled:text-gray-500",
              error && "border-red-400 focus:ring-red-400",
              rightAdornment && "pr-10",
              className
            )}
            {...props}
          />
          {rightAdornment && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightAdornment}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
