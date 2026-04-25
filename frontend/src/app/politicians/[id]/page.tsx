"use client"

import Link from "next/link"
import { use, useState } from "react"
import { AmendmentPanel } from "@/components/features/amendment-panel"
import { CardExpensePanel } from "@/components/features/card-expense-panel"
import { ExpensePanel } from "@/components/features/expense-panel"
import { MandateTimeline } from "@/components/features/mandate-timeline"
import { NewsPanel } from "@/components/features/news-panel"
import { PresidentProfileContent } from "@/components/features/president-profile-content"
import { PropositionsPanel } from "@/components/features/propositions-panel"
import { SenatorProfile } from "@/components/features/senator-profile"
import { VotesPanel } from "@/components/features/votes-panel"
import { Avatar, Badge, Button, Card, EmptyState, Skeleton } from "@/components/ui"
import { usePolitician } from "@/lib/hooks"
import type { Politician } from "@/types"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

type Tab = "expenses" | "propositions" | "votes" | "amendments"

const DEPUTY_TABS: { id: Tab; label: string }[] = [
  { id: "expenses", label: "Gastos" },
  { id: "propositions", label: "Proposições" },
  { id: "votes", label: "Votações" },
  { id: "amendments", label: "Emendas" },
]

const ROLE_LABELS: Record<string, string> = {
  deputado_federal: "Deputado Federal",
  senador: "Senador",
  presidente: "Presidente",
  vice_presidente: "Vice-Presidente",
  ministro: "Ministro de Estado",
  ministro_stf: "Ministro do STF",
  ministro_tribunal_superior: "Ministro de Tribunal Superior",
  governador: "Governador",
  prefeito: "Prefeito",
  deputado_estadual: "Deputado Estadual",
  vereador: "Vereador",
}

function DeputyTabs({ politicianId }: { politicianId: number }) {
  const [activeTab, setActiveTab] = useState<Tab>("expenses")

  return (
    <>
      <div className="flex gap-1 border-b border-border-default">
        {DEPUTY_TABS.map((tab) => (
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

      <div>
        {activeTab === "expenses" && <ExpensePanel politicianId={politicianId} />}
        {activeTab === "propositions" && <PropositionsPanel politicianId={politicianId} />}
        {activeTab === "votes" && <VotesPanel politicianId={politicianId} />}
        {activeTab === "amendments" && <AmendmentPanel politicianId={politicianId} />}
      </div>
    </>
  )
}

const SOURCE_LABEL: Record<string, string> = {
  presidente: "Presidência da República / TSE",
  vice_presidente: "Presidência da República / TSE",
  ministro: "Presidência da República",
  ministro_stf: "Supremo Tribunal Federal / Presidência da República",
  ministro_tribunal_superior: "Tribunal Superior / Presidência da República",
  governador: "TSE / Tribunal Regional Eleitoral",
  prefeito: "TRE / Câmara Municipal",
}

function MandateInfoCard({ politician }: { politician: Politician }) {
  const mandateStart = politician.legislature
  const mandateEnd = politician.mandate_end
  const isCurrent = mandateEnd === null

  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-1">
        {/* Mandate period */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Mandato</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {mandateStart ?? "—"}
            <span className="text-text-muted font-normal text-lg mx-2">→</span>
            {isCurrent ? (
              <span className="text-accent">Em curso</span>
            ) : (
              mandateEnd ?? "—"
            )}
          </p>
        </div>

        {/* Duration */}
        {mandateStart && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Duração</p>
            <p className="text-2xl font-bold text-text-primary tabular-nums">
              {isCurrent
                ? `${new Date().getFullYear() - mandateStart} anos`
                : `${(mandateEnd ?? new Date().getFullYear()) - mandateStart} anos`}
            </p>
          </div>
        )}

        {/* Party */}
        {politician.party && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Partido</p>
            <p className="text-lg font-semibold text-text-primary">{politician.party}</p>
          </div>
        )}

        {/* Source note */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Fonte</p>
          <p className="text-sm text-text-secondary">
            {SOURCE_LABEL[politician.role] ?? "Fonte oficial"}
          </p>
        </div>
      </div>
    </Card>
  )
}

type PresidentTab = "perfil" | "cartao" | "emendas" | "noticias"

const PRESIDENT_TABS: { id: PresidentTab; label: string }[] = [
  { id: "perfil", label: "Perfil" },
  { id: "cartao", label: "Cartão Corporativo" },
  { id: "emendas", label: "Emendas" },
  { id: "noticias", label: "Notícias" },
]

function PresidentProfile({ politician }: { politician: Politician }) {
  const [activeTab, setActiveTab] = useState<PresidentTab>("perfil")

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border-default overflow-x-auto">
        {PRESIDENT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "perfil" && (
          <div className="space-y-6">
            <MandateInfoCard politician={politician} />
            <PresidentProfileContent politician={politician} />
          </div>
        )}
        {activeTab === "cartao" && <CardExpensePanel />}
        {activeTab === "emendas" && (
          <AmendmentPanel
            yearFrom={politician.legislature ?? undefined}
            yearTo={politician.mandate_end ?? undefined}
          />
        )}
        {activeTab === "noticias" && <NewsPanel politicianId={politician.id} />}
      </div>
    </div>
  )
}

type SimpleTab = "perfil" | "noticias"

const SIMPLE_TABS: { id: SimpleTab; label: string }[] = [
  { id: "perfil", label: "Perfil" },
  { id: "noticias", label: "Notícias" },
]

function VicePresidentProfile({ politician }: { politician: Politician }) {
  const [activeTab, setActiveTab] = useState<SimpleTab>("perfil")

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border-default">
        {SIMPLE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "perfil" && (
          <div className="space-y-6">
            <MandateInfoCard politician={politician} />
            <MandateTimeline role={politician.role} currentPoliticianId={politician.id} />
          </div>
        )}
        {activeTab === "noticias" && <NewsPanel politicianId={politician.id} />}
      </div>
    </div>
  )
}

function MinistroProfile({ politician }: { politician: Politician }) {
  const [activeTab, setActiveTab] = useState<SimpleTab>("perfil")

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border-default">
        {SIMPLE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "perfil" && (
          <div className="space-y-6">
            <MandateInfoCard politician={politician} />
          </div>
        )}
        {activeTab === "noticias" && <NewsPanel politicianId={politician.id} />}
      </div>
    </div>
  )
}

function MinistroSTFProfile({ politician }: { politician: Politician }) {
  const [activeTab, setActiveTab] = useState<SimpleTab>("perfil")

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border-default">
        {SIMPLE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "perfil" && (
          <div className="space-y-6">
            <MandateInfoCard politician={politician} />
          </div>
        )}
        {activeTab === "noticias" && <NewsPanel politicianId={politician.id} />}
      </div>
    </div>
  )
}

function GovernorProfile({ politician }: { politician: Politician }) {
  const [activeTab, setActiveTab] = useState<SimpleTab>("perfil")

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border-default">
        {SIMPLE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "perfil" && (
          <div className="space-y-6">
            <MandateInfoCard politician={politician} />
          </div>
        )}
        {activeTab === "noticias" && <NewsPanel politicianId={politician.id} />}
      </div>
    </div>
  )
}


export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = use(params)
  const politicianId = Number(id)

  const { data: politician, isLoading, error } = usePolitician(politicianId)

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/">
          <Button variant="ghost" size="sm">← Voltar</Button>
        </Link>
        <p className="text-sm text-danger">Político não encontrado.</p>
      </div>
    )
  }

  const roleLabel = politician ? (ROLE_LABELS[politician.role] ?? politician.role) : null

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/">
        <Button variant="ghost" size="sm">← Voltar</Button>
      </Link>

      {/* Profile header */}
      {isLoading ? (
        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ) : politician ? (
        <div className="flex items-center gap-5 pb-6 border-b border-border-default">
          <Avatar src={politician.photo_url} name={politician.name} size="xl" />
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-text-primary">{politician.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {roleLabel && <Badge variant="warning">{roleLabel}</Badge>}
              {politician.party && <Badge variant="accent">{politician.party}</Badge>}
              {politician.municipality ? (
                <Badge variant="default">{politician.municipality} · {politician.uf}</Badge>
              ) : politician.uf && (
                <Badge variant="default">{politician.uf}</Badge>
              )}
              {politician.role === "deputado_federal" && politician.legislature && (
                <Badge variant="default">{politician.legislature}ª Legislatura</Badge>
              )}
            </div>
            <div className="flex gap-4 text-xs text-text-muted">
              {politician.email && (
                <a href={`mailto:${politician.email}`} className="hover:text-accent transition-colors">
                  {politician.email}
                </a>
              )}
              {politician.phone && <span>{politician.phone}</span>}
            </div>
          </div>
        </div>
      ) : null}

      {/* Role-specific content */}
      {!isLoading && politician && (
        <>
          {politician.role === "deputado_federal" && (
            <DeputyTabs politicianId={politicianId} />
          )}
          {politician.role === "presidente" && (
            <PresidentProfile politician={politician} />
          )}
          {politician.role === "vice_presidente" && (
            <VicePresidentProfile politician={politician} />
          )}
          {politician.role === "ministro" && (
            <MinistroProfile politician={politician} />
          )}
          {(politician.role === "ministro_stf" || politician.role === "ministro_tribunal_superior") && (
            <MinistroSTFProfile politician={politician} />
          )}
          {politician.role === "senador" && (
            <SenatorProfile politician={politician} />
          )}
          {["governador", "prefeito", "vereador", "deputado_estadual"].includes(politician.role) && (
            <GovernorProfile politician={politician} />
          )}
          {!["deputado_federal", "presidente", "vice_presidente", "ministro", "ministro_stf", "ministro_tribunal_superior", "senador", "governador", "prefeito", "vereador", "deputado_estadual"].includes(politician.role) && (
            <EmptyState
              title="Dados em desenvolvimento"
              description={`Informações detalhadas para ${roleLabel?.toLowerCase() ?? "este tipo de político"} serão disponibilizadas em breve.`}
              icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              }
            />
          )}
        </>
      )}
    </div>
  )
}
