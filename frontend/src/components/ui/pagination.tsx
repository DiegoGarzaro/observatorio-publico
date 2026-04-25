import { Button } from "./button"

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

function Pagination({ page, total, pageSize, onPageChange, className = "" }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  return (
    <div
      className={["flex items-center justify-between text-sm text-text-secondary", className].join(" ")}
    >
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          ←
        </Button>

        <span className="px-2 tabular-nums">
          {page} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          →
        </Button>
      </div>
    </div>
  )
}

export { Pagination }
export type { PaginationProps }
