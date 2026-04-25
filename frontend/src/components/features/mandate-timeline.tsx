"use client"

import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardHeader, CardTitle, Skeleton } from "@/components/ui"
import { CHART_COLORS, CURRENT_YEAR } from "@/lib/constants"
import { useRoleTimeline } from "@/lib/hooks"
import type { Politician } from "@/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineEntry {
  id: number
  name: string
  shortName: string
  party: string | null
  gap: number
  duration: number
  start: number
  end: number
  isCurrent: boolean
  isSelected: boolean
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: TimelineEntry }>
  minYear: number
}

function MandateTooltip({ active, payload, minYear }: TooltipProps) {
  if (!active || !payload?.length) return null

  // The last bar in the stack carries the actual entry data
  const entry = payload[payload.length - 1]?.payload
  if (!entry || entry.duration === 0) return null

  const startYear = minYear + entry.gap
  const endYear = startYear + entry.duration

  return (
    <div
      style={{
        backgroundColor: "#1e2b1e",
        border: "1px solid rgba(159,254,87,0.3)",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "12px",
        color: "#e8f5e0",
        pointerEvents: "none",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 4, color: "#ffffff" }}>{entry.name}</p>
      {entry.party && (
        <p style={{ color: "#9ca3af", marginBottom: 6 }}>{entry.party}</p>
      )}
      <p style={{ color: "#d1fae5" }}>
        {startYear} → {entry.isCurrent ? "Em curso" : endYear}
      </p>
      <p style={{ color: "#6b7280", marginTop: 2 }}>
        {entry.duration} {entry.duration === 1 ? "ano" : "anos"}
      </p>
      {entry.isSelected && (
        <p style={{ color: CHART_COLORS.primary, fontWeight: 500, marginTop: 4 }}>
          Perfil atual
        </p>
      )}
    </div>
  )
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 2) return fullName
  return `${parts[0]} ${parts[parts.length - 1]}`
}

function buildEntries(politicians: Politician[], currentId: number, minYear: number): TimelineEntry[] {
  return politicians
    .filter((p) => p.legislature !== null)
    .sort((a, b) => (b.legislature ?? 0) - (a.legislature ?? 0)) // most recent first for vertical chart
    .map((p) => {
      const start = p.legislature!
      const end = p.mandate_end ?? CURRENT_YEAR
      const gap = start - minYear
      const duration = Math.max(1, end - start)

      return {
        id: p.id,
        name: p.name,
        shortName: abbreviateName(p.name),
        party: p.party,
        gap,
        duration,
        start,
        end,
        isCurrent: p.mandate_end === null,
        isSelected: p.id === currentId,
      }
    })
}

function getBarColor(entry: TimelineEntry): string {
  if (entry.isSelected) return CHART_COLORS.primary
  if (entry.isCurrent) return CHART_COLORS.secondary
  return CHART_COLORS.muted
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface MandateTimelineProps {
  role: string
  currentPoliticianId: number
}

export function MandateTimeline({ role, currentPoliticianId }: MandateTimelineProps) {
  const router = useRouter()
  const { data: politicians, isLoading } = useRoleTimeline(role)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mandatos</CardTitle>
        </CardHeader>
        <div className="space-y-2 px-1 pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  const eligible = politicians?.filter((p) => p.legislature !== null) ?? []
  if (eligible.length === 0) return null

  const minYear = Math.min(...eligible.map((p) => p.legislature!))
  const maxYear = CURRENT_YEAR + 1
  const totalYears = maxYear - minYear

  const data = buildEntries(eligible, currentPoliticianId, minYear)

  // Generate evenly-spaced year ticks (at most ~8)
  const rawInterval = Math.ceil(totalYears / 7)
  const interval = rawInterval < 2 ? 2 : rawInterval
  const ticks: number[] = []
  for (let i = 0; i <= totalYears; i += interval) ticks.push(i)
  if (ticks[ticks.length - 1] !== totalYears) ticks.push(totalYears)

  const BAR_HEIGHT = 40
  const AXIS_HEIGHT = 40
  const chartHeight = data.length * BAR_HEIGHT + AXIS_HEIGHT
  const yAxisWidth = 130

  function handleBarClick(chartData: unknown) {
    const entry = chartData as TimelineEntry
    if (entry?.id) router.push(`/politicians/${entry.id}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Mandatos</CardTitle>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: CHART_COLORS.primary }}
            />
            Perfil atual
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: CHART_COLORS.secondary }}
            />
            Em curso
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: CHART_COLORS.muted }}
            />
            Encerrado
          </span>
        </div>
      </CardHeader>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 24, left: 0, bottom: 20 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            domain={[0, totalYears]}
            ticks={ticks}
            tickFormatter={(v: number) => String(minYear + v)}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "#2d3f2d" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={yAxisWidth}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<MandateTooltip minYear={minYear} />}
            cursor={{ fill: "rgba(159,254,87,0.04)" }}
          />

          {/* Transparent gap — pushes the mandate bar to the correct start year */}
          <Bar
            dataKey="gap"
            stackId="mandate"
            fill="transparent"
            isAnimationActive={false}
          />

          {/* Mandate duration bar */}
          <Bar
            dataKey="duration"
            stackId="mandate"
            radius={[3, 3, 3, 3]}
            isAnimationActive
            animationDuration={500}
            cursor="pointer"
            onClick={handleBarClick}
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.id}`}
                fill={getBarColor(entry)}
                fillOpacity={entry.isSelected || entry.isCurrent ? 1 : 0.65}
                stroke={entry.isSelected ? CHART_COLORS.primary : "transparent"}
                strokeWidth={2}
              />
            ))}
          </Bar>

          {/* "Hoje" reference line */}
          <ReferenceLine
            x={CURRENT_YEAR - minYear}
            stroke={CHART_COLORS.primary}
            strokeDasharray="4 3"
            strokeOpacity={0.35}
            label={{
              value: "Hoje",
              position: "insideBottomRight",
              fill: CHART_COLORS.muted,
              fontSize: 10,
              dy: 16,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
