"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle, EmptyState, Skeleton, StatCard } from "@/components/ui"
import { useCardExpenseSummary, useCardExpenses } from "@/lib/hooks"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatBRLShort(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} mi`
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace(".", ",")} mil`
  }
  return formatBRL(value)
}

// SIAFI organ code for Presidência da República
const PRESIDENCIA = "20101"

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

// ─── CardExpensePanel ─────────────────────────────────────────────────────────

export function CardExpensePanel() {
  const [year, setYear] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data: summary, isLoading: summaryLoading } = useCardExpenseSummary(PRESIDENCIA, year)
  const { data: list, isLoading: listLoading } = useCardExpenses({
    organ_code: PRESIDENCIA,
    year,
    page,
  })

  const hasData = summary && (summary.count > 0 || summary.by_month.length > 0)
  const maxSupplier = summary?.top_suppliers[0]?.total ?? 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Cartão Corporativo (CPGF)</h3>
          <CardDescription className="mt-0.5">
            Despesas com cartão de pagamento do governo federal — Presidência da República
          </CardDescription>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => { setYear(undefined); setPage(1) }}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              year === undefined
                ? "bg-accent text-black border-accent"
                : "text-text-secondary border-border-default hover:text-text-primary",
            ].join(" ")}
          >
            Todos
          </button>
          {YEAR_OPTIONS.map((y) => (
            <button
              key={y}
              onClick={() => { setYear(y); setPage(1) }}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                year === y
                  ? "bg-accent text-black border-accent"
                  : "text-text-secondary border-border-default hover:text-text-primary",
              ].join(" ")}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-default p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
            </div>
          ))}
        </div>
      ) : hasData ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Gasto"
            value={formatBRLShort(summary.total)}
            description={`${summary.count} transaç${summary.count !== 1 ? "ões" : "ão"}`}
          />
          <StatCard
            label="Maior Fornecedor"
            value={summary.top_suppliers[0]?.supplier_name ?? "—"}
            description={summary.top_suppliers[0] ? formatBRLShort(summary.top_suppliers[0].total) : ""}
          />
        </div>
      ) : !summaryLoading ? (
        <EmptyState
          title="Sem dados disponíveis"
          description="Não há registros de cartão corporativo para a Presidência no período selecionado."
          icon={
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          }
        />
      ) : null}

      {/* Top suppliers */}
      {summary && summary.top_suppliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Principais Fornecedores</CardTitle>
            <span className="text-xs text-text-muted">por valor total recebido</span>
          </CardHeader>
          <div className="space-y-3 px-1 pb-1">
            {summary.top_suppliers.map((s, idx) => {
              const pct = maxSupplier > 0 ? (s.total / maxSupplier) * 100 : 0
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm text-text-primary truncate block">
                        {s.supplier_name ?? "Fornecedor não identificado"}
                      </span>
                      {s.supplier_cnpj && (
                        <span className="text-[10px] text-text-muted">{s.supplier_cnpj}</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-text-secondary tabular-nums">
                        {formatBRLShort(s.total)}
                      </span>
                      <p className="text-[10px] text-text-muted">{s.count} compra{s.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-raised overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Transaction list */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            {list && (
              <span className="text-xs text-text-muted">
                {list.total.toLocaleString("pt-BR")} registros
              </span>
            )}
          </CardHeader>

          {listLoading ? (
            <div className="divide-y divide-border-default">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 px-1">
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : list && list.items.length > 0 ? (
            <div className="divide-y divide-border-default">
              {list.items.map((tx) => (
                <div key={tx.id} className="flex items-start justify-between gap-3 py-3 px-1">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm text-text-primary truncate">
                      {tx.supplier_name ?? "Fornecedor não identificado"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      {tx.holder_name && <span>{tx.holder_name}</span>}
                      {tx.transaction_date && (
                        <span>
                          · {new Date(tx.transaction_date + "T00:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      {tx.management_unit_name && (
                        <span className="hidden sm:inline">· {tx.management_unit_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-accent tabular-nums">
                      {formatBRL(tx.value)}
                    </p>
                    {tx.installments > 1 && (
                      <p className="text-[10px] text-text-muted">{tx.installments}x</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted px-1 pb-3">Nenhuma transação encontrada.</p>
          )}
        </Card>
      )}

      {/* Monthly breakdown */}
      {summary && summary.by_month.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Mensal</CardTitle>
          </CardHeader>
          <div className="divide-y divide-border-default">
            {[...summary.by_month].reverse().map((m) => (
              <div key={`${m.year}-${m.month}`} className="flex items-center justify-between gap-3 py-2.5 px-1">
                <span className="text-sm text-text-secondary">
                  {MONTH_LABELS[m.month]} {m.year}
                </span>
                <div className="text-right">
                  <span className="text-sm font-medium text-text-primary tabular-nums">
                    {formatBRLShort(m.total)}
                  </span>
                  <p className="text-[10px] text-text-muted">{m.count} transaç{m.count !== 1 ? "ões" : "ão"}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
