"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TicketStatus } from "@/types/app.types";

const STATUS_COLORS: Record<TicketStatus, string> = {
  Aberto: "#3B82F6",
  "Em progresso": "#F59E0B",
  Resolvido: "#22C55E",
  Fechado: "#9CA3AF",
};

interface StatusPieChartProps {
  data: { status: TicketStatus; count: number }[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 280, h: 260 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function measure() {
      const node = containerRef.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      setDims({
        w: Math.max(r.width, 160),
        h: Math.max(r.height, 200),
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Sem dados
      </div>
    );
  }

  const outerRadius = Math.round(
    Math.min(92, Math.max(40, Math.min(dims.w * 0.34, dims.h * 0.36)))
  );

  const singleSlice = data.length === 1;

  return (
    <div
      ref={containerRef}
      className="mx-auto flex min-h-[220px] h-[min(320px,52vw)] max-h-[360px] w-full flex-col sm:min-h-[240px] [&_.recharts-wrapper]:outline-none [&_svg]:outline-none focus-within:outline-none"
    >
      <div className="min-h-0 flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="46%"
              outerRadius={outerRadius}
              label={
                singleSlice
                  ? false
                  : ({ percent }) =>
                      percent >= 0.06 ? `${(percent * 100).toFixed(0)}%` : ""
              }
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] ?? "#ccc"}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Tickets"]} />
            <Legend
              verticalAlign="bottom"
              layout="horizontal"
              align="center"
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {singleSlice && (
        <p className="shrink-0 py-0.5 text-center text-sm font-medium text-gray-700">
          100%
        </p>
      )}
    </div>
  );
}
