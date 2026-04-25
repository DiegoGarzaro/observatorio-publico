"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CongressoOverview } from "@/components/features/congresso-overview"
import { JudiciarioOverview } from "@/components/features/judiciario-overview"
import { TribunaisSuperioresOverview } from "@/components/features/tribunais-superiores-overview"
import { TribunaisFederaisOverview } from "@/components/features/tribunais-federais-overview"
import { AssembleiasOverview } from "@/components/features/assembleias-overview"
import { SecretariasEstaduaisOverview } from "@/components/features/secretarias-estaduais-overview"
import { TribunaisJusticaOverview } from "@/components/features/tribunais-justica-overview"
import { VarasOverview } from "@/components/features/varas-overview"
import { CamarasMunicipaisOverview } from "@/components/features/camaras-municipais-overview"
import { SecretariasMunicipaisOverview } from "@/components/features/secretarias-municipais-overview"
import { PoliticiansList } from "@/components/features/politicians-list"
import { PresidentsTimeline } from "@/components/features/presidents-timeline"
import { RoleDescription } from "@/components/features/role-description"
import { VicePresidentsTimeline } from "@/components/features/vice-presidents-timeline"
import { EmptyState } from "@/components/ui"
import { CATEGORIES } from "@/lib/constants"

interface CategoriaPageProps {
  params: Promise<{ categoria: string }>
}

export default function CategoriaPage({ params }: CategoriaPageProps) {
  const { categoria } = use(params)
  const category = CATEGORIES.find((c) => c.slug === categoria)

  if (!category) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label="Voltar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{category.label}</h1>
          <p className="text-sm text-text-secondary mt-0.5">{category.description}</p>
        </div>
      </div>

      {/* Role description — skipped for overview pages (they handle their own context) */}
      {!["congresso", "judiciario", "tribunais-superiores", "tribunais-federais", "assembleias", "secretarias-estaduais", "tribunais-justica", "varas-primeira-instancia", "camaras-municipais", "secretarias-municipais"].includes(category.slug) && (
        <RoleDescription role={category.role} />
      )}

      {/* Content */}
      {category.available && category.slug === "congresso" ? (
        <CongressoOverview />
      ) : category.available && category.slug === "judiciario" ? (
        <JudiciarioOverview />
      ) : category.available && category.slug === "tribunais-superiores" ? (
        <TribunaisSuperioresOverview />
      ) : category.available && category.slug === "tribunais-federais" ? (
        <TribunaisFederaisOverview />
      ) : category.available && category.slug === "assembleias" ? (
        <AssembleiasOverview />
      ) : category.available && category.slug === "secretarias-estaduais" ? (
        <SecretariasEstaduaisOverview />
      ) : category.available && category.slug === "tribunais-justica" ? (
        <TribunaisJusticaOverview />
      ) : category.available && category.slug === "varas-primeira-instancia" ? (
        <VarasOverview />
      ) : category.available && category.slug === "camaras-municipais" ? (
        <CamarasMunicipaisOverview />
      ) : category.available && category.slug === "secretarias-municipais" ? (
        <SecretariasMunicipaisOverview />
      ) : category.available && category.slug === "presidentes" ? (
        <PresidentsTimeline />
      ) : category.available && category.slug === "vice-presidentes" ? (
        <VicePresidentsTimeline />
      ) : category.available ? (
        <PoliticiansList fixedRole={category.role} />
      ) : (
        <EmptyState
          title="Em desenvolvimento"
          description={`Dados de ${category.label.toLowerCase()} serão disponibilizados em breve.`}
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          }
        />
      )}
    </div>
  )
}
