"use client"

import { Input, Select } from "@/components/ui"
import { ROLE_OPTIONS, UF_OPTIONS } from "@/lib/constants"
import type { Party } from "@/types"

interface SearchFiltersProps {
  name: string
  party: string
  uf: string
  role: string
  municipality?: string
  parties: Party[]
  hideRole?: boolean
  showMunicipality?: boolean
  onNameChange: (v: string) => void
  onPartyChange: (v: string) => void
  onUfChange: (v: string) => void
  onRoleChange: (v: string) => void
  onMunicipalityChange?: (v: string) => void
}

export function SearchFilters({
  name,
  party,
  uf,
  role,
  municipality = "",
  parties,
  hideRole = false,
  showMunicipality = false,
  onNameChange,
  onPartyChange,
  onUfChange,
  onRoleChange,
  onMunicipalityChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="flex-1 min-w-48">
        <Input
          placeholder="Buscar por nome..."
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          leftIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          }
        />
      </div>

      {showMunicipality && (
        <div className="flex-1 min-w-40">
          <Input
            placeholder="Município..."
            value={municipality}
            onChange={(e) => onMunicipalityChange?.(e.target.value)}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
          />
        </div>
      )}

      {!hideRole && (
        <Select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          placeholder="Tipo"
          options={ROLE_OPTIONS}
          className="sm:w-44"
        />
      )}

      <Select
        value={party}
        onChange={(e) => onPartyChange(e.target.value)}
        placeholder="Partido"
        options={parties.map((p) => ({ value: p.abbreviation, label: p.abbreviation }))}
        className="sm:w-36"
      />

      <Select
        value={uf}
        onChange={(e) => onUfChange(e.target.value)}
        placeholder="Estado"
        options={UF_OPTIONS.map((u) => ({ value: u, label: u }))}
        className="sm:w-32"
      />
    </div>
  )
}
