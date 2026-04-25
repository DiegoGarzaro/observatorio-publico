"use client"

import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardHeader, CardTitle } from "@/components/ui"
import { CHART_COLORS } from "@/lib/constants"
import { formatCurrency, getMonthLabel } from "@/lib/utils"
import type { ExpenseSummary } from "@/types"

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.muted,
  "#57c4fe",
  "#fe57c4",
]

const tooltipStyle = {
  backgroundColor: "#1e2b1e",
  border: "1px solid rgba(159,254,87,0.4)",
  borderRadius: "6px",
  color: "#e8f5e0",
  fontSize: "12px",
}

interface ExpenseChartsProps {
  summary: ExpenseSummary
}

export function ExpenseLineChart({ summary }: ExpenseChartsProps) {
  const data = summary.by_month.map((m) => ({
    label: getMonthLabel(m.month),
    total: Number(m.total),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por mês</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fill: "#8a9e80", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8a9e80", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            width={52}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [formatCurrency(Number(v)), "Total"]}
            cursor={{ stroke: "rgba(159,254,87,0.2)" }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#areaGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function ExpensePieChart({ summary }: ExpenseChartsProps) {
  const data = summary.by_category.slice(0, 7).map((c) => ({
    name: c.category,
    value: Number(c.total),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por categoria</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="42%"
            innerRadius={55}
            outerRadius={85}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => [formatCurrency(Number(v)), name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: "#8a9e80", fontSize: 11 }}>
                {value.length > 30 ? value.slice(0, 30) + "…" : value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
