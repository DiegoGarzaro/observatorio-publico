"use client"

import { useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  Pagination,
  Select,
  Skeleton,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { YEAR_OPTIONS } from "@/lib/constants"
import { usePresenceStats, useVotes } from "@/lib/hooks"

// Display labels for directions that need clarification in the UI.
// "Votou" in the Senado API means the senator participated in a secret ballot
// (IndicadorVotacaoSecreta=Sim) — the individual direction is not disclosed.
const DIRECTION_LABELS: Record<string, string> = {
  "Votou": "Voto Secreto",
  "P-NRV": "Presente – Não registrou voto",
  "LS": "Licença saúde",
}

function directionLabel(d: string) {
  return DIRECTION_LABELS[d] ?? d
}

const DIRECTION_COLORS: Record<string, string> = {
  "Sim": "#9ffe57",
  "Não": "#ff5794",
  "Abstenção": "#ffd557",
  "Obstrução": "#57c4ff",
  "Artigo 17": "#a857ff",
  "Ausente": "#4a5568",
  // Senado-specific
  "Votou": "#57c4ff",
  "Licença saúde": "#4a5568",
  "Licença": "#4a5568",
  "P-NRV": "#ffd557",
  "Presente – Não registrou voto": "#ffd557",
  "LS": "#4a5568",
}

const DIRECTION_VARIANTS: Record<string, "positive" | "danger" | "warning" | "accent" | "default"> = {
  "Sim": "positive",
  "Não": "danger",
  "Abstenção": "warning",
  "Obstrução": "accent",
  // Senado-specific
  "Votou": "accent",
  "P-NRV": "warning",
  "Presente – Não registrou voto": "warning",
  "Licença saúde": "default",
  "Licença": "default",
  "LS": "default",
}

function directionVariant(d: string) {
  return DIRECTION_VARIANTS[d] ?? "default"
}

function directionColor(d: string) {
  return DIRECTION_COLORS[d] ?? "#4a5568"
}

const DIRECTION_OPTIONS = [
  { value: "Sim", label: "Sim" },
  { value: "Não", label: "Não" },
  { value: "Abstenção", label: "Abstenção" },
  { value: "Obstrução", label: "Obstrução" },
  { value: "Ausente", label: "Ausente" },
]

interface VotesPanelProps {
  politicianId: number
}

export function VotesPanel({ politicianId }: VotesPanelProps) {
  const [year, setYear] = useState("")
  const [direction, setDirection] = useState("")
  const [page, setPage] = useState(1)

  const yearParam = year ? Number(year) : undefined

  const { data: presence, isLoading: presenceLoading } = usePresenceStats(politicianId, yearParam)
  const { data: votes, isLoading: votesLoading } = useVotes(politicianId, {
    year: yearParam,
    direction: direction || undefined,
    page,
  })

  const pieData = presence?.by_direction.map((d) => ({
    name: directionLabel(d.direction),
    value: d.count,
    fill: directionColor(d.direction),
  })) ?? []

  return (
    <div className="space-y-6">
      {/* Year filter */}
      <div className="flex items-center gap-3">
        <Select
          value={year}
          onChange={(e) => { setYear(e.target.value); setPage(1) }}
          placeholder="Todos os anos"
          options={YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))}
          className="w-40"
        />
      </div>

      {/* Presence stats */}
      {presenceLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : presence && presence.total > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KPIs */}
          <div className="space-y-4">
            <StatCard
              label="Taxa de Presença"
              value={`${presence.presence_rate.toFixed(1)}%`}
              badge={
                presence.presence_rate >= 80
                  ? { label: "Alta", variant: "positive" }
                  : presence.presence_rate >= 60
                  ? { label: "Média", variant: "warning" }
                  : { label: "Baixa", variant: "danger" }
              }
            />
            <StatCard
              label="Total de Votações"
              value={presence.total.toLocaleString("pt-BR")}
              description={year ? `Filtrado por ${year}` : "Todos os anos"}
            />
          </div>

          {/* Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Voto</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={42}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1a1d23", border: "1px solid #2a2d35", borderRadius: 6 }}
                  labelStyle={{ color: "#c4d0e3" }}
                  formatter={(v, name) => [`${v} votos`, name]}
                />
                <Legend
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#8b9cb6", fontSize: 11 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      ) : null}

      {/* Vote list */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={direction}
            onChange={(e) => { setDirection(e.target.value); setPage(1) }}
            placeholder="Todos os votos"
            options={DIRECTION_OPTIONS}
            className="w-44"
          />
          {votes && (
            <span className="text-xs text-text-muted self-center">
              {votes.total} {votes.total === 1 ? "registro" : "registros"}
            </span>
          )}
        </div>

        {votesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : votes?.items.length === 0 ? (
          <EmptyState
            title="Nenhum voto encontrado"
            description="Tente ajustar os filtros."
            icon={
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            }
          />
        ) : (
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Data</TableHead>
                  <TableHead className="w-32">Voto</TableHead>
                  <TableHead>Votação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {votes?.items.map((vote) => (
                  <TableRow key={vote.id}>
                    <TableCell className="font-mono text-xs text-text-muted align-top pt-3">
                      {vote.session_date
                        ? new Date(vote.session_date + "T00:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell className="align-top pt-3">
                      <Badge variant={directionVariant(vote.direction)}>
                        {directionLabel(vote.direction)}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top pt-3">
                      <div className="space-y-1">
                        {vote.proposition_title ? (
                          <p className="text-sm text-text-primary line-clamp-2">
                            {vote.proposition_ref && (
                              vote.proposition_url ? (
                                <a
                                  href={vote.proposition_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono font-semibold text-accent-primary hover:underline"
                                >
                                  [{vote.proposition_ref}]
                                </a>
                              ) : (
                                <span className="font-mono font-semibold text-accent-primary">[{vote.proposition_ref}]</span>
                              )
                            )}
                            {vote.proposition_ref ? " " : ""}{vote.proposition_title}
                          </p>
                        ) : vote.description ? (
                          <p className="text-sm text-text-muted line-clamp-2">
                            {vote.proposition_ref && (
                              vote.proposition_url ? (
                                <a
                                  href={vote.proposition_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono font-semibold text-accent-primary hover:underline"
                                >
                                  [{vote.proposition_ref}]
                                </a>
                              ) : (
                                <span className="font-mono font-semibold text-accent-primary">[{vote.proposition_ref}]</span>
                              )
                            )}
                            {vote.proposition_ref ? " " : ""}{vote.description}
                          </p>
                        ) : (
                          <span className="font-mono text-xs text-text-muted">{vote.external_votacao_id}</span>
                        )}
                        {vote.proposition_title && vote.description && (
                          <p className="text-xs text-text-muted line-clamp-1">{vote.description}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {votes && votes.total > 20 && (
          <Pagination
            page={page}
            total={votes.total}
            pageSize={20}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
