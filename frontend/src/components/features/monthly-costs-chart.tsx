"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardDescription, CardHeader, CardTitle, Select, SkeletonCard, StatCard } from "@/components/ui"
import { CHART_COLORS, CURRENT_YEAR, YEAR_OPTIONS } from "@/lib/constants"
import { useGlobalExpenseSummary } from "@/lib/hooks"
import { formatCurrency, getMonthLabel } from "@/lib/utils"

const tooltipStyle = {
  backgroundColor: "#1e2b1e",
  border: "1px solid rgba(159,254,87,0.4)",
  borderRadius: "6px",
  color: "#e8f5e0",
  fontSize: "12px",
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(0)}M`
  return `R$${(value / 1_000).toFixed(0)}k`
}

export function MonthlyCostsChart() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const { data, isLoading } = useGlobalExpenseSummary(year)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    )
  }

  if (!data) return null

  const chartData = data.by_month.map((m) => ({
    label: getMonthLabel(m.month),
    total: Number(m.total),
  }))

  const total = Number(data.total)
  const avgPerMonth = data.by_month.length > 0 ? total / data.by_month.length : 0
  const avgPerPolitician = data.politician_count > 0 ? total / data.politician_count : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          {data.politician_count} deputados com gastos registrados em {year}
        </p>
        <Select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          options={YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total gasto no ano"
          value={formatCurrency(total)}
          description="Soma de todos os reembolsos do período"
        />
        <StatCard
          label="Média por mês"
          value={formatCurrency(avgPerMonth)}
          description="Quanto foi gasto em média em cada mês"
        />
        <StatCard
          label="Média por deputado"
          value={data.politician_count > 0 ? formatCurrency(avgPerPolitician) : "—"}
          description="Total dividido pelo número de deputados"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gasto mensal com verba parlamentar — {year}</CardTitle>
          <CardDescription>
            Cada barra representa o total de reembolsos aprovados em um mês.
          </CardDescription>
        </CardHeader>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-text-muted text-sm">
            Sem dados para o período selecionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(159,254,87,0.08)"
                vertical={false}
              />
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
                tickFormatter={formatYAxis}
                width={60}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [formatCurrency(Number(v)), "Total reembolsado"]}
                cursor={{ fill: "rgba(159,254,87,0.06)" }}
              />
              <Bar
                dataKey="total"
                fill={CHART_COLORS.primary}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
