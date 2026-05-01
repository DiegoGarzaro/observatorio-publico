import Link from "next/link"
import { Avatar, Badge, Card } from "@/components/ui"
import { formatCurrency } from "@/lib/utils"
import type { PoliticianWithMetrics } from "@/types"

interface ElectionPoliticianCardProps {
  politician: PoliticianWithMetrics
}

function compactCurrency(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`
  return formatCurrency(value)
}

function presenceVariant(rate: number): "positive" | "warning" | "danger" | "default" {
  if (rate === 0) return "default"
  if (rate >= 90) return "positive"
  if (rate >= 70) return "warning"
  return "danger"
}

export function ElectionPoliticianCard({ politician }: ElectionPoliticianCardProps) {
  const hasMetrics =
    politician.total_votes > 0 ||
    politician.proposition_count > 0 ||
    Number(politician.total_expenses) > 0

  return (
    <Link href={`/politicians/${politician.id}`} className="block group">
      <Card hover className="flex items-center gap-4 cursor-pointer">
        <Avatar
          src={politician.photo_url}
          name={politician.name}
          size="lg"
          className="shrink-0"
        />

        <div className="flex-1 min-w-0 space-y-2">
          {/* Name and identification */}
          <div>
            <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
              {politician.name}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {politician.party && (
                <Badge variant="accent">{politician.party}</Badge>
              )}
              {politician.uf && <Badge variant="default">{politician.uf}</Badge>}
            </div>
          </div>

          {/* Metrics row */}
          {hasMetrics ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {politician.total_votes > 0 && (
                <Badge
                  variant={presenceVariant(politician.presence_rate)}
                  title={`Presença em ${politician.total_votes} votações registradas`}
                >
                  {politician.presence_rate}% pres.
                </Badge>
              )}
              {Number(politician.total_expenses) > 0 && (
                <Badge variant="default" title="Total gasto com verba parlamentar (CEAP)">
                  {compactCurrency(Number(politician.total_expenses))} CEAP
                </Badge>
              )}
              {politician.proposition_count > 0 && (
                <Badge variant="default" title="Total de proposições apresentadas">
                  {politician.proposition_count} prop.
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-text-muted">Sem métricas registradas</p>
          )}
        </div>

        <span className="text-text-muted group-hover:text-accent transition-colors shrink-0">
          →
        </span>
      </Card>
    </Link>
  )
}
