"use client"

import { useState } from "react"
import { ExpenseLineChart, ExpensePieChart } from "./expense-charts"
import { Insights } from "./insights"
import { Select, StatCard, SkeletonCard, Skeleton, EmptyState, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { useExpenseSummary, useExpenses } from "@/lib/hooks"
import { CURRENT_YEAR, YEAR_OPTIONS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"

const PAGE_SIZE = 15

interface ExpensePanelProps {
  politicianId: number
}

export function ExpensePanel({ politicianId }: ExpensePanelProps) {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [page, setPage] = useState(1)

  const { data: summary, isLoading: loadingSummary } = useExpenseSummary(politicianId, year)
  const { data: expenses, isLoading: loadingExpenses } = useExpenses(politicianId, { year, page })

  const yearOptions = YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Painel de Gastos (CEAP)</h2>
        <Select
          value={String(year)}
          onChange={(e) => { setYear(Number(e.target.value)); setPage(1) }}
          options={yearOptions}
          className="w-28"
        />
      </div>

      {/* KPI */}
      {loadingSummary ? (
        <SkeletonCard />
      ) : summary ? (
        <StatCard
          label="Total gasto no ano"
          value={formatCurrency(Number(summary.total))}
          description={`${summary.by_category.length} categorias · ${summary.by_month.filter(m => Number(m.total) > 0).length} meses com gastos`}
        />
      ) : null}

      {/* Charts */}
      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : summary && Number(summary.total) > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExpenseLineChart summary={summary} />
            <ExpensePieChart summary={summary} />
          </div>
          <Insights summary={summary} />
        </>
      ) : (
        <EmptyState
          title="Sem gastos registrados"
          description={`Nenhum gasto encontrado para ${year}.`}
        />
      )}

      {/* Expense table */}
      {loadingExpenses ? (
        <Skeleton className="h-64 w-full" />
      ) : expenses && expenses.items.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary">Detalhamento</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.items.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-text-muted font-mono text-xs whitespace-nowrap">
                    {String(expense.month).padStart(2, "0")}/{expense.year}
                  </TableCell>
                  <TableCell className="text-xs max-w-[180px] truncate">
                    {expense.category}
                  </TableCell>
                  <TableCell className="text-xs text-text-secondary max-w-[160px] truncate">
                    {expense.supplier_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-text-primary whitespace-nowrap">
                    {formatCurrency(Number(expense.value))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            total={expenses.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  )
}
