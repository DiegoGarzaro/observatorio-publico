"use client"

import Link from "next/link"
import { Avatar, Skeleton } from "@/components/ui"
import { CHART_COLORS } from "@/lib/constants"
import { useRoleTimeline } from "@/lib/hooks"
import type { Politician } from "@/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function abbreviateName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 2) return name
  return `${parts[0]} ${parts[parts.length - 1]}`
}

// ─── Single row ───────────────────────────────────────────────────────────────

interface VPRowProps {
  politician: Politician
  order: number
  side: "left" | "right"
  isFirst: boolean
  isLast: boolean
}

function VPRow({ politician, order, side, isFirst, isLast }: VPRowProps) {
  const isCurrent = politician.mandate_end === null
  const startYear = politician.legislature
  const endYear   = politician.mandate_end ?? new Date().getFullYear()

  const accent = CHART_COLORS.primary
  const muted  = CHART_COLORS.muted

  const card = (
    <Link
      href={`/politicians/${politician.id}`}
      className="group flex items-center gap-3 rounded-xl border p-3 w-full transition-all"
      style={
        isCurrent
          ? { borderColor: `${accent}55`, backgroundColor: `${accent}0a` }
          : { borderColor: "#1e2e1e", backgroundColor: "#0f1a0f" }
      }
    >
      {side === "right" && (
        <div
          className="shrink-0 rounded-full transition-transform group-hover:scale-105"
          style={isCurrent ? { boxShadow: `0 0 0 2px ${accent}` } : undefined}
        >
          <Avatar src={politician.photo_url} name={politician.name} size="md" />
        </div>
      )}

      <div className={`flex-1 min-w-0 space-y-0.5 ${side === "left" ? "text-right" : "text-left"}`}>
        <p
          className="text-sm font-semibold leading-tight truncate"
          style={{ color: isCurrent ? accent : "#e8f5e0" }}
        >
          {abbreviateName(politician.name)}
        </p>
        {politician.party && (
          <p className="text-xs" style={{ color: muted }}>
            {politician.party}
          </p>
        )}
        <p className="text-xs tabular-nums" style={{ color: "#4b5563" }}>
          {startYear}–{isCurrent ? "hoje" : endYear}
        </p>
        {isCurrent && (
          <span
            className="inline-block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${accent}18`,
              color: accent,
              border: `1px solid ${accent}40`,
            }}
          >
            Em curso
          </span>
        )}
      </div>

      {side === "left" && (
        <div
          className="shrink-0 rounded-full transition-transform group-hover:scale-105"
          style={isCurrent ? { boxShadow: `0 0 0 2px ${accent}` } : undefined}
        >
          <Avatar src={politician.photo_url} name={politician.name} size="md" />
        </div>
      )}
    </Link>
  )

  const badge = (
    <div
      className="flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold shrink-0 z-10"
      style={{
        backgroundColor: isCurrent ? accent : "#0f1a0f",
        border: `2px solid ${isCurrent ? accent : muted}`,
        color: isCurrent ? "#000" : muted,
        boxShadow: isCurrent ? `0 0 14px ${accent}55` : undefined,
      }}
    >
      {order}
    </div>
  )

  const lineColor = "#1e2e1e"

  return (
    <div className="grid items-center gap-x-4" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
      <div className="flex justify-end">
        {side === "left" && card}
      </div>

      <div className="flex flex-col items-center self-stretch">
        <div
          className="w-px flex-1"
          style={{ backgroundColor: isFirst ? "transparent" : lineColor, minHeight: 16 }}
        />
        {badge}
        <div
          className="w-px flex-1"
          style={{ backgroundColor: isLast ? "transparent" : lineColor, minHeight: 16 }}
        />
      </div>

      <div className="flex justify-start">
        {side === "right" && card}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="grid items-center gap-x-4 py-3"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          <div className="flex justify-end">
            {i % 2 === 0 && <Skeleton className="h-16 w-full max-w-[220px] rounded-xl" />}
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            {i % 2 !== 0 && <Skeleton className="h-16 w-full max-w-[220px] rounded-xl" />}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── VicePresidentsTimeline ───────────────────────────────────────────────────

export function VicePresidentsTimeline() {
  const { data: politicians, isLoading } = useRoleTimeline("vice_presidente")

  if (isLoading) return <TimelineSkeleton />

  const vps = (politicians ?? [])
    .filter((p) => p.legislature !== null)
    .sort((a, b) => (a.legislature ?? 0) - (b.legislature ?? 0))

  if (vps.length === 0) {
    return (
      <div className="rounded-xl border border-border-default bg-bg-raised px-5 py-8 text-center space-y-2">
        <p className="text-sm font-semibold text-text-primary">Nenhum vice-presidente cadastrado ainda</p>
        <p className="text-sm text-text-muted">
          Os dados de vice-presidentes serão adicionados em breve.
        </p>
      </div>
    )
  }

  return (
    <div>
      {vps.map((p, i) => (
        <VPRow
          key={p.id}
          politician={p}
          order={i + 1}
          side={i % 2 === 0 ? "left" : "right"}
          isFirst={i === 0}
          isLast={i === vps.length - 1}
        />
      ))}
    </div>
  )
}
