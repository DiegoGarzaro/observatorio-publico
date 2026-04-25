"use client"

import { useState } from "react"
import {
  Badge,
  Card,
  EmptyState,
  Pagination,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { YEAR_OPTIONS } from "@/lib/constants"
import { usePropositions } from "@/lib/hooks"

const PROP_TYPE_OPTIONS = [
  { value: "PL", label: "PL" },
  { value: "PEC", label: "PEC" },
  { value: "MPV", label: "MPV" },
  { value: "PDL", label: "PDL" },
  { value: "PLP", label: "PLP" },
  { value: "RCP", label: "RCP" },
  { value: "REQ", label: "REQ" },
]

interface PropositionsPanelProps {
  politicianId: number
}

export function PropositionsPanel({ politicianId }: PropositionsPanelProps) {
  const [propType, setPropType] = useState("")
  const [year, setYear] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = usePropositions(politicianId, {
    prop_type: propType || undefined,
    year: year ? Number(year) : undefined,
    page,
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select
          value={propType}
          onChange={(e) => { setPropType(e.target.value); setPage(1) }}
          placeholder="Tipo"
          options={PROP_TYPE_OPTIONS}
          className="w-32"
        />
        <Select
          value={year}
          onChange={(e) => { setYear(e.target.value); setPage(1) }}
          placeholder="Ano"
          options={YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))}
          className="w-28"
        />
        {data && (
          <span className="text-xs text-text-muted self-center">
            {data.total} {data.total === 1 ? "proposição" : "proposições"}
          </span>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <EmptyState
          title="Nenhuma proposição encontrada"
          description="Tente ajustar os filtros."
          icon={
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Tipo</TableHead>
                <TableHead className="w-24">Número</TableHead>
                <TableHead className="w-16">Ano</TableHead>
                <TableHead>Ementa</TableHead>
                <TableHead className="w-40">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((prop) => (
                <TableRow key={prop.id}>
                  <TableCell>
                    <Badge variant="accent">{prop.prop_type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-text-secondary">
                    {prop.number}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-text-muted">
                    {prop.year}
                  </TableCell>
                  <TableCell className="text-xs text-text-primary max-w-md">
                    <span className="line-clamp-2">{prop.title || "—"}</span>
                  </TableCell>
                  <TableCell>
                    {prop.status ? (
                      <span className="text-xs text-text-muted truncate block max-w-36">
                        {prop.status}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {data && data.total > 20 && (
        <Pagination
          page={page}
          total={data.total}
          pageSize={20}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
