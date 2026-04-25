"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ComparePanel } from "@/components/features/compare-panel"
import { PoliticianCard } from "@/components/features/politician-card"
import { SearchFilters } from "@/components/features/search-filters"
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Spinner,
} from "@/components/ui"
import { useCompare, useParties, usePoliticians } from "@/lib/hooks"
import type { PoliticianListItem } from "@/types"

const MAX_SELECTED = 4

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ComparePage() {
  const [selected, setSelected] = useState<PoliticianListItem[]>([])
  const [name, setName] = useState("")
  const [party, setParty] = useState("")
  const [uf, setUf] = useState("")
  const [role, setRole] = useState("")

  const debouncedName = useDebounce(name)
  const { data: parties = [] } = useParties()

  const { data: searchResults, isLoading: searchLoading } = usePoliticians({
    name: debouncedName || undefined,
    party: party || undefined,
    uf: uf || undefined,
    role: role || undefined,
    page: 1,
    page_size: 10,
  })

  const selectedIds = selected.map((p) => p.id)
  const { data: compareData, isLoading: compareLoading } = useCompare(selectedIds)

  function toggleSelect(politician: PoliticianListItem) {
    setSelected((prev) => {
      const already = prev.find((p) => p.id === politician.id)
      if (already) return prev.filter((p) => p.id !== politician.id)
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, politician]
    })
  }

  const isSelected = (id: number) => selected.some((p) => p.id === id)
  const canAddMore = selected.length < MAX_SELECTED

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Comparador de Políticos</h1>
          <p className="text-sm text-text-secondary mt-1">
            Selecione de 2 a 4 deputados para comparar
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">← Voltar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: search + selection */}
        <div className="space-y-4">
          {/* Selected politicians */}
          {selected.length > 0 && (
            <Card>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
                Selecionados ({selected.length}/{MAX_SELECTED})
              </p>
              <div className="space-y-2">
                {selected.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <Avatar src={p.photo_url} name={p.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{p.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {p.party && <Badge variant="accent">{p.party}</Badge>}
                        {p.uf && <Badge variant="default">{p.uf}</Badge>}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSelect(p)}
                      className="text-text-muted hover:text-danger transition-colors text-xs shrink-0"
                      aria-label="Remover"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Search */}
          <Card>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
              Buscar deputados
            </p>
            <SearchFilters
              name={name}
              party={party}
              uf={uf}
              role={role}
              parties={parties}
              onNameChange={setName}
              onPartyChange={setParty}
              onUfChange={setUf}
              onRoleChange={setRole}
            />
          </Card>

          {/* Results */}
          <div className="space-y-2">
            {searchLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : searchResults?.items.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">Nenhum resultado.</p>
            ) : (
              searchResults?.items.map((politician) => {
                const alreadySelected = isSelected(politician.id)
                const disabled = !alreadySelected && !canAddMore

                return (
                  <button
                    key={politician.id}
                    onClick={() => !disabled && toggleSelect(politician)}
                    className="w-full text-left"
                    disabled={disabled}
                  >
                    <Card
                      className={[
                        "transition-all",
                        alreadySelected
                          ? "border-accent bg-accent/5"
                          : disabled
                          ? "opacity-40 cursor-not-allowed"
                          : "cursor-pointer hover:border-border-focus",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={politician.photo_url} name={politician.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">
                            {politician.name}
                          </p>
                          <div className="flex gap-1 mt-0.5">
                            {politician.party && <Badge variant="accent">{politician.party}</Badge>}
                            {politician.uf && <Badge variant="default">{politician.uf}</Badge>}
                          </div>
                        </div>
                        {alreadySelected && (
                          <span className="text-accent text-xs font-bold shrink-0">✓</span>
                        )}
                      </div>
                    </Card>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right: comparison output */}
        <div className="lg:col-span-2">
          {selected.length < 2 ? (
            <EmptyState
              title="Selecione ao menos 2 deputados"
              description="Use a busca para encontrar e adicionar deputados à comparação."
              icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
          ) : compareLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Spinner size="md" />
              <p className="text-sm text-text-muted">Carregando dados comparativos...</p>
            </div>
          ) : compareData ? (
            <ComparePanel items={compareData.items} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
