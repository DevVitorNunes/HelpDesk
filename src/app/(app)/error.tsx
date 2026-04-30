"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-7 w-7 text-red-600" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">Algo deu errado</p>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
      </div>
      <Button variant="secondary" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
