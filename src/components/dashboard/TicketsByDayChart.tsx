"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketsByDayChartProps {
  data: { date: string; count: number }[];
}

export function TicketsByDayChart({ data }: TicketsByDayChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date + "T12:00:00"), "dd/MM", { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          tickLine={false}
          interval={Math.max(1, Math.floor(formatted.length / 7))}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
          formatter={(value) => [value, "Tickets"]}
          labelFormatter={(label) => `Dia: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#F97316"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
