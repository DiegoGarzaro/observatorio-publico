"use client"

import { useEffect, useState } from "react"
import { PoliticianCard } from "@/components/features/politician-card"
import { SearchFilters } from "@/components/features/search-filters"
import { EmptyState, Pagination, SkeletonCard } from "@/components/ui"
import { useParties, usePoliticians } from "@/lib/hooks"

const PAGE_SIZE = 20

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

interface PoliticiansListProps {
  fixedRole?: string
}

export function PoliticiansList({ fixedRole }: PoliticiansListProps) {
  const [name, setName] = useState("")
  const [party, setParty] = useState("")
  const [uf, setUf] = useState("")
  const [role, setRole] = useState("")
  const [municipality, setMunicipality] = useState("")
  const [page, setPage] = useState(1)

  const debouncedName = useDebounce(name)
  const debouncedMunicipality = useDebounce(municipality)

  const showMunicipality = fixedRole === "vereador"

  const { data, isLoading } = usePoliticians({
    name: debouncedName || undefined,
    party: party || undefined,
    uf: uf || undefined,
    municipality: debouncedMunicipality || undefined,
    role: fixedRole ?? (role || undefined),
    page,
    page_size: PAGE_SIZE,
  })

  const { data: parties = [] } = useParties()

  useEffect(() => { setPage(1) }, [debouncedName, party, uf, role, debouncedMunicipality])

  return (
    <div className="space-y-6">
      <SearchFilters
        name={name}
        party={party}
        uf={uf}
        role={role}
        municipality={municipality}
        parties={parties}
        hideRole={!!fixedRole}
        showMunicipality={showMunicipality}
        onNameChange={setName}
        onPartyChange={setParty}
        onUfChange={setUf}
        onRoleChange={setRole}
        onMunicipalityChange={setMunicipality}
      />

      {data && (
        <p className="text-xs text-text-muted">
          {data.total} {data.total === 1 ? "resultado" : "resultados"}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data?.items.length === 0 ? (
        <EmptyState
          title="Nenhum resultado encontrado"
          description="Tente ajustar os filtros de busca."
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data?.items.map((politician) => (
            <PoliticianCard key={politician.id} politician={politician} />
          ))}
        </div>
      )}

      {data && (
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
