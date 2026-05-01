"use client"

import { useEffect, useState } from "react"
import { ElectionPoliticianCard } from "@/components/features/eleicoes/election-politician-card"
import { EmptyState, Input, Pagination, Select, SkeletonCard } from "@/components/ui"
import { useParties, usePoliticiansWithMetrics } from "@/lib/hooks"
import { UF_OPTIONS } from "@/lib/constants"

const PAGE_SIZE = 20
const ACCENT = "#9ffe57"

interface ElectionPoliticiansListProps {
  role: string
}

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function UfChips({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (uf: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onSelect("")}
        className="rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors"
        style={
          selected === ""
            ? { borderColor: `${ACCENT}50`, backgroundColor: `${ACCENT}12`, color: ACCENT }
            : { borderColor: "#1a2e1a", backgroundColor: "#0b140b", color: "#6b8f6b" }
        }
      >
        Todos
      </button>
      {UF_OPTIONS.map((uf) => {
        const active = selected === uf
        return (
          <button
            key={uf}
            onClick={() => onSelect(uf)}
            className="rounded-md border px-2 py-1 text-[11px] font-semibold tabular-nums transition-colors"
            style={
              active
                ? { borderColor: `${ACCENT}50`, backgroundColor: `${ACCENT}12`, color: ACCENT }
                : { borderColor: "#1a2e1a", backgroundColor: "#0b140b", color: "#6b8f6b" }
            }
          >
            {uf}
          </button>
        )
      })}
    </div>
  )
}

export function ElectionPoliticiansList({ role }: ElectionPoliticiansListProps) {
  const [name, setName] = useState("")
  const [uf, setUf] = useState("")
  const [party, setParty] = useState("")
  const [page, setPage] = useState(1)

  const debouncedName = useDebounce(name)

  const { data, isLoading } = usePoliticiansWithMetrics({
    name: debouncedName || undefined,
    party: party || undefined,
    uf: uf || undefined,
    role,
    page,
    page_size: PAGE_SIZE,
  })

  const { data: parties = [] } = useParties()

  // Reset to page 1 inside each filter setter — keeps page state in sync
  // with filter changes without resorting to setState-in-useEffect.
  const handleNameChange = (v: string) => {
    setName(v)
    setPage(1)
  }
  const handleUfChange = (v: string) => {
    setUf(v)
    setPage(1)
  }
  const handlePartyChange = (v: string) => {
    setParty(v)
    setPage(1)
  }

  return (
    <div className="space-y-5">
      {/* UF filter — featured */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
            Filtre pelo seu estado
          </p>
          {uf && (
            <button
              onClick={() => handleUfChange("")}
              className="text-[11px] text-text-muted hover:text-text-primary transition-colors"
            >
              limpar
            </button>
          )}
        </div>
        <UfChips selected={uf} onSelect={handleUfChange} />
      </div>

      {/* Secondary filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Buscar por nome..."
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
          />
        </div>
        <Select
          value={party}
          onChange={(e) => handlePartyChange(e.target.value)}
          placeholder="Partido"
          options={parties.map((p) => ({ value: p.abbreviation, label: p.abbreviation }))}
          className="sm:w-36"
        />
      </div>

      {data && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {data.total} {data.total === 1 ? "incumbente" : "incumbentes"}
            {uf && ` em ${uf}`}
          </p>
          <p className="text-[10px] text-text-muted">
            Métricas do mandato atual · clique para ver perfil completo
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <EmptyState
          title="Nenhum resultado"
          description={
            uf
              ? `Nenhum incumbente registrado para ${uf} com esses filtros.`
              : "Nenhum incumbente encontrado com esses filtros."
          }
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data?.items.map((p) => (
            <ElectionPoliticianCard key={p.id} politician={p} />
          ))}
        </div>
      )}

      {data && data.total > PAGE_SIZE && (
        <Pagination
          page={page}
          total={data.total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
