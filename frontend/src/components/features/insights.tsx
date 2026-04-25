import { Badge, Card } from "@/components/ui"
import { formatCurrency } from "@/lib/utils"
import type { ExpenseSummary } from "@/types"

interface InsightsProps {
  summary: ExpenseSummary
}

export function Insights({ summary }: InsightsProps) {
  const insights: { label: string; value: string; variant: "positive" | "warning" | "danger" | "default" }[] = []

  // Top category concentration
  if (summary.by_category.length > 0) {
    const top = summary.by_category[0]
    const pct = summary.total > 0
      ? ((Number(top.total) / Number(summary.total)) * 100).toFixed(0)
      : "0"
    const variant = Number(pct) > 50 ? "warning" : "default"
    insights.push({
      label: "Maior categoria de gasto",
      value: `${top.category} — ${pct}% do total (${formatCurrency(Number(top.total))})`,
      variant,
    })
  }

  // Months with spending
  const activeMonths = summary.by_month.filter((m) => Number(m.total) > 0).length
  if (activeMonths > 0) {
    const avg = Number(summary.total) / activeMonths
    insights.push({
      label: "Média mensal",
      value: `${formatCurrency(avg)} em ${activeMonths} ${activeMonths === 1 ? "mês" : "meses"} ativos`,
      variant: "default",
    })
  }

  // Peak month
  if (summary.by_month.length > 0) {
    const peak = [...summary.by_month].sort((a, b) => Number(b.total) - Number(a.total))[0]
    insights.push({
      label: "Mês de maior gasto",
      value: `${peak.month.toString().padStart(2, "0")}/${peak.year} — ${formatCurrency(Number(peak.total))}`,
      variant: "default",
    })
  }

  if (insights.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Insights
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {insights.map((insight) => (
          <Card key={insight.label} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant={insight.variant}>●</Badge>
              <span className="text-xs font-medium text-text-secondary">{insight.label}</span>
            </div>
            <p className="text-sm text-text-primary">{insight.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
