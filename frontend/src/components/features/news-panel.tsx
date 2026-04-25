"use client"

import { Card, Skeleton } from "@/components/ui"
import { useNews } from "@/lib/hooks"

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "hoje"
  if (diffDays === 1) return "ontem"
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem.`
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`
  return `há ${Math.floor(diffDays / 365)} anos`
}

function formatCachedAt(dateStr: string | null): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return "agora mesmo"
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}

interface NewsPanelProps {
  politicianId: number
}

export function NewsPanel({ politicianId }: NewsPanelProps) {
  const { data, isLoading } = useNews(politicianId)

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Notícias Recentes
          </h3>
          {data && (
            <div className="text-right shrink-0 space-y-0.5">
              <p className="text-xs text-text-muted">via Google News</p>
              {data.cached_at && (
                <p className="text-xs text-text-muted">
                  atualizado {formatCachedAt(data.cached_at)}
                </p>
              )}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && data && data.items.length === 0 && (
          <p className="text-base text-text-muted py-2">
            Nenhuma notícia encontrada para {data.politician_name}.
          </p>
        )}

        {!isLoading && data && data.items.length > 0 && (
          <ul className="space-y-3 divide-y divide-border-default">
            {data.items.map((item, i) => (
              <li key={i} className={i > 0 ? "pt-3" : ""}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block space-y-1"
                >
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    {item.source && <span>{item.source}</span>}
                    {item.source && item.published_at && <span>·</span>}
                    {item.published_at && (
                      <span>{formatRelativeDate(item.published_at)}</span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
