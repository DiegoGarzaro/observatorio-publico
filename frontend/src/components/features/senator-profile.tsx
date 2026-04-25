"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, Skeleton, StatCard } from "@/components/ui"
import { AmendmentPanel } from "@/components/features/amendment-panel"
import { ExpensePanel } from "@/components/features/expense-panel"
import { VotesPanel } from "@/components/features/votes-panel"
import { useSenatorDetail } from "@/lib/hooks"
import type { Politician, SenatorCommittee, SenatorMandate } from "@/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert legislature number to its starting calendar year. */
function legToYear(leg: number): number {
  return 1987 + (leg - 48) * 4
}

function formatBirthDate(iso: string): string {
  const [year, month, day] = iso.split("-")
  return `${day}/${month}/${year}`
}

function calcAge(iso: string): number {
  const birth = new Date(iso)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  return hadBirthday ? age : age - 1
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function MandateCard({ politician }: { politician: Politician }) {
  const leg = politician.legislature
  const startYear = leg ? legToYear(leg) : null
  const endYear = startYear ? startYear + 7 : null

  return (
    <Card>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-1">
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Legislatura</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {leg ? `${leg}ª` : "—"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Mandato</p>
          <p className="text-lg font-bold text-text-primary tabular-nums">
            {startYear ?? "—"}
            <span className="text-text-muted font-normal mx-1.5">→</span>
            {endYear ?? "—"}
          </p>
        </div>

        {politician.party && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Partido</p>
            <p className="text-lg font-semibold text-text-primary">{politician.party}</p>
          </div>
        )}

        {politician.uf && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Estado</p>
            <p className="text-lg font-semibold text-text-primary">{politician.uf}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

function ContactCard({ politician, website }: { politician: Politician; website: string | null }) {
  const hasContact = politician.email || politician.phone || website
  if (!hasContact) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contato</CardTitle>
      </CardHeader>
      <div className="space-y-3 px-1 pb-1">
        {politician.email && (
          <a
            href={`mailto:${politician.email}`}
            className="flex items-center gap-3 text-sm text-text-secondary hover:text-accent transition-colors group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-text-muted group-hover:text-accent transition-colors">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {politician.email}
          </a>
        )}
        {politician.phone && (
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-text-muted">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {politician.phone}
          </div>
        )}
        {website && (
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-text-secondary hover:text-accent transition-colors group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-text-muted group-hover:text-accent transition-colors">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="truncate">{website.replace(/^https?:\/\//, "")}</span>
          </a>
        )}
      </div>
    </Card>
  )
}

function CommitteesCard({ committees }: { committees: SenatorCommittee[] }) {
  if (committees.length === 0) return null

  const roleColor: Record<string, string> = {
    Presidente:    "text-accent",
    "Vice-Presidente": "text-[#57fe9f]",
    Titular:       "text-text-secondary",
    Suplente:      "text-text-muted",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comissões</CardTitle>
        <span className="text-xs text-text-muted">{committees.length} ativas</span>
      </CardHeader>
      <div className="space-y-0 divide-y divide-border-default">
        {committees.map((c, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2.5 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {c.abbreviation && (
                <span className="text-[10px] font-bold text-accent bg-bg-raised border border-border-default px-1.5 py-0.5 rounded shrink-0">
                  {c.abbreviation}
                </span>
              )}
              <span className="text-sm text-text-primary truncate">{c.name}</span>
            </div>
            {c.role && (
              <span className={`text-xs font-medium shrink-0 ${roleColor[c.role] ?? "text-text-muted"}`}>
                {c.role}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function MandateHistoryCard({ mandates }: { mandates: SenatorMandate[] }) {
  if (mandates.length <= 1) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Mandatos</CardTitle>
        <span className="text-xs text-text-muted">{mandates.length} mandatos</span>
      </CardHeader>
      <div className="space-y-0 divide-y divide-border-default">
        {[...mandates].reverse().map((m) => (
          <div key={m.legislature} className="flex items-center justify-between gap-3 py-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-muted tabular-nums">{m.legislature}ª</span>
              {m.uf && (
                <span className="text-xs text-text-muted border border-border-default rounded px-1.5 py-0.5">
                  {m.uf}
                </span>
              )}
            </div>
            <span className="text-sm text-text-secondary tabular-nums">
              {m.start_year} → {m.end_year}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type SenatorTab = "perfil" | "gastos" | "votacoes" | "emendas"

const SENATOR_TABS: { id: SenatorTab; label: string }[] = [
  { id: "perfil", label: "Perfil" },
  { id: "gastos", label: "Gastos (CEAPS)" },
  { id: "votacoes", label: "Votações" },
  { id: "emendas", label: "Emendas" },
]

// ─── SenatorProfile ───────────────────────────────────────────────────────────

interface SenatorProfileProps {
  politician: Politician
}

export function SenatorProfile({ politician }: SenatorProfileProps) {
  const { data: detail, isLoading } = useSenatorDetail(politician.id)
  const [activeTab, setActiveTab] = useState<SenatorTab>("perfil")

  const leg = politician.legislature
  const startYear = leg ? legToYear(leg) : null

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-default">
        {SENATOR_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2",
              activeTab === tab.id
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Perfil tab */}
      {activeTab === "perfil" && (
        <>
          {/* Mandate + key stats */}
          <MandateCard politician={politician} />

          {/* Bio stat cards */}
          {detail && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {detail.birth_date && (
                <StatCard
                  label="Nascimento"
                  value={formatBirthDate(detail.birth_date)}
                  description={`${calcAge(detail.birth_date)} anos`}
                />
              )}
              {detail.mandates.length > 0 && (
                <StatCard
                  label="Mandatos no Senado"
                  value={String(detail.mandates.length)}
                  description={`desde ${detail.mandates[0]?.start_year ?? startYear ?? "—"}`}
                />
              )}
              {detail.committees.length > 0 && (
                <StatCard
                  label="Comissões ativas"
                  value={String(detail.committees.length)}
                  description={
                    detail.committees.find((c) => c.role === "Presidente")
                      ? "Preside 1 comissão"
                      : undefined
                  }
                />
              )}
              {detail.mandates.length > 0 && startYear && (
                <StatCard
                  label="Senador desde"
                  value={String(detail.mandates[0]?.start_year ?? startYear)}
                  description={`${new Date().getFullYear() - (detail.mandates[0]?.start_year ?? startYear)} anos`}
                />
              )}
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border-default p-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Contact */}
          <ContactCard politician={politician} website={detail?.website ?? null} />

          {/* Committees */}
          {isLoading ? (
            <Card>
              <CardHeader><CardTitle>Comissões</CardTitle></CardHeader>
              <div className="space-y-2 px-1 pb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            </Card>
          ) : detail?.committees.length ? (
            <CommitteesCard committees={detail.committees} />
          ) : null}

          {/* Mandate history */}
          {detail && <MandateHistoryCard mandates={detail.mandates} />}
        </>
      )}

      {/* Gastos tab */}
      {activeTab === "gastos" && <ExpensePanel politicianId={politician.id} />}

      {/* Votações tab */}
      {activeTab === "votacoes" && <VotesPanel politicianId={politician.id} />}

      {/* Emendas tab */}
      {activeTab === "emendas" && <AmendmentPanel politicianId={politician.id} />}
    </div>
  )
}
