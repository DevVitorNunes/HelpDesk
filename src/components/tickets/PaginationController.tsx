"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

export function PaginationController({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function handlePageChange(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
  );
}
