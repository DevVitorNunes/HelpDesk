"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TicketsByAgentChartProps {
  data: { nome: string; count: number }[];
}

export function TicketsByAgentChart({ data }: TicketsByAgentChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Sem dados
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="nome"
          width={128}
          interval={0}
          tick={{ fontSize: 11, fill: "#374151" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
          formatter={(value) => [value, "Tickets abertos"]}
        />
        <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
