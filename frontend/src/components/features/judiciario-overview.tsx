"use client"

import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── Court card ────────────────────────────────────────────────────────────────

interface CourtCardProps {
  href?: string
  color: string
  title: string
  subtitle: string
  description: string
  facts: { label: string; value: string }[]
  icon: React.ReactNode
  available?: boolean
  cta?: string
}

function CourtCard({ href, color, title, subtitle, description, facts, icon, available = true, cta }: CourtCardProps) {
  const inner = (
    <div
      className="rounded-xl border p-5 space-y-4 transition-all duration-200 h-full"
      style={{
        borderColor: available ? `${color}30` : "#1a2320",
        backgroundColor: available ? `${color}06` : "#0b130b",
        cursor: available ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        if (available) {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${color}60`
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = `${color}0e`
        }
      }}
      onMouseLeave={(e) => {
        if (available) {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${color}30`
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = `${color}06`
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span style={{ color: available ? color : "#374c37" }}>{icon}</span>
            <h2
              className="text-base font-bold"
              style={{ color: available ? "var(--color-text-primary)" : "#374c37" }}
            >
              {title}
            </h2>
          </div>
          <p className="text-xs font-medium" style={{ color: available ? color : "#374c37" }}>{subtitle}</p>
        </div>
        {available ? (
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="shrink-0 mt-0.5 text-text-muted opacity-40"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        ) : (
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2a3830" strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </div>

      {/* Description */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: available ? "var(--color-text-secondary)" : "#374c37" }}
      >
        {description}
      </p>

      {/* Facts */}
      <dl
        className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4"
        style={{ borderColor: available ? `${color}20` : "#161e16" }}
      >
        {facts.map((f) => (
          <div key={f.label} className="space-y-0.5">
            <dt
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: available ? "var(--color-text-muted)" : "#2a3830" }}
            >
              {f.label}
            </dt>
            <dd
              className="text-xs font-semibold"
              style={{ color: available ? "var(--color-text-primary)" : "#374c37" }}
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* CTA */}
      {available && (
        <p className="text-xs font-medium" style={{ color }}>
          {cta ?? "Ver todos os ministros"} →
        </p>
      )}
      {!available && (
        <p className="text-xs font-medium" style={{ color: "#2a3830" }}>
          Em breve
        </p>
      )}
    </div>
  )

  if (available && href) {
    return <Link href={href} className="block group">{inner}</Link>
  }
  return <div>{inner}</div>
}

// ─── Appointment process ───────────────────────────────────────────────────────

function AppointmentProcess() {
  const steps = [
    {
      number: "1",
      title: "Presidente indica",
      description: "O Presidente da República escolhe livremente o candidato — não há critério objetivo de seleção além do requisito de ser brasileiro nato, com mais de 35 anos, de notável saber jurídico e reputação ilibada.",
    },
    {
      number: "2",
      title: "Senado sabatina",
      description: "O indicado passa por audiência pública na Comissão de Constituição e Justiça (CCJ). A aprovação exige maioria absoluta do plenário — 41 dos 81 senadores.",
    },
    {
      number: "3",
      title: "Posse e vitaliciedade",
      description: "Aprovado, o ministro toma posse e adquire vitaliciedade imediata. Só pode perder o cargo por crime de responsabilidade julgado pelo Senado — não por decisão do Presidente.",
    },
    {
      number: "4",
      title: "Aposentadoria compulsória",
      description: "Ao completar 75 anos, o ministro é aposentado compulsoriamente com subsídio integral. A aposentadoria é custeada pelo Estado.",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como um ministro é nomeado</CardTitle>
        <CardDescription className="mt-0.5">O processo de indicação e aprovação para o STF</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            <div
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-0.5"
              style={{ backgroundColor: "#c084fc18", color: "#c084fc", border: "1px solid #c084fc40" }}
            >
              {step.number}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">{step.title}</p>
              <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── STF powers ───────────────────────────────────────────────────────────────

function STFPowers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Competências exclusivas do STF</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Julgar ADIs, ADCs e ADPFs — controle de constitucionalidade abstrato",
            "Processar e julgar o Presidente, Vice, congressistas e ministros",
            "Julgar conflitos de competência entre STJ e outros tribunais superiores",
            "Homologar sentenças estrangeiras e conceder exequatur",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-accent mt-0.5 shrink-0">›</span>
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Independência judicial</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Vitaliciedade: não pode ser demitido pelo Presidente nem pelo Congresso",
            "Irredutibilidade de subsídio: salário não pode ser cortado por ato político",
            "Inamovibilidade: não pode ser transferido para outro tribunal",
            "Foro privilegiado: só o próprio STF pode processar seus ministros",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-accent mt-0.5 shrink-0">›</span>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

// ─── JudiciarioOverview ────────────────────────────────────────────────────────

const SCALE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3v18M3 9l9-6 9 6M5 20h14" />
    <path d="M5 12l-2 5h4L5 12zM19 12l-2 5h4L19 12z" />
  </svg>
)

export function JudiciarioOverview() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            O Poder Judiciário federal é responsável por interpretar e aplicar a Constituição e as leis do país.
            Diferente do Legislativo e Executivo, seus membros não são eleitos — são indicados pelo Presidente e
            aprovados pelo Senado, com mandato vitalício até os 75 anos. O STF é o órgão de cúpula: guarda da
            Constituição e última palavra em matéria constitucional.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Órgão de cúpula</dt>
              <dd className="text-xs font-semibold text-text-primary">STF (11 ministros)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Mandato</dt>
              <dd className="text-xs font-semibold text-text-primary">Vitalício até 75 anos</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Teto salarial</dt>
              <dd className="text-xs font-semibold text-text-primary">R$ 46.366/mês (STF)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Sede</dt>
              <dd className="text-xs font-semibold text-text-primary">Praça dos Três Poderes · Brasília</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Courts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CourtCard
          href="/stf"
          color="#c084fc"
          title="Supremo Tribunal Federal"
          subtitle="STF · guarda da Constituição"
          description="A corte suprema do Brasil. Decide em última instância sobre a constitucionalidade de leis, processa e julga altas autoridades e é a última palavra em matéria constitucional."
          facts={[
            { label: "Membros", value: "11 ministros" },
            { label: "Mandato", value: "Vitalício até 75 anos" },
            { label: "Quórum pleno", value: "6 ministros" },
            { label: "Subsídio", value: "R$ 46.366/mês (teto)" },
          ]}
          icon={SCALE_ICON}
          available={true}
        />
        <CourtCard
          href="/tribunais-superiores"
          color="#a78bfa"
          title="Tribunais Superiores"
          subtitle="STJ · TSE · STM · TST"
          description="As últimas instâncias das Justiças especializadas: STJ unifica a lei federal, TSE rege as eleições, STM julga crimes militares e TST decide conflitos trabalhistas."
          facts={[
            { label: "STJ", value: "33 ministros" },
            { label: "TST", value: "27 ministros" },
            { label: "STM", value: "15 ministros" },
            { label: "TSE", value: "7 ministros" },
          ]}
          icon={SCALE_ICON}
          available={true}
          cta="Ver tribunais superiores"
        />
        <CourtCard
          href="/tribunais-federais"
          color="#818cf8"
          title="Tribunais Regionais Federais"
          subtitle="TRF1 ao TRF6 · 2ª instância"
          description="Julgam recursos de decisões dos juízes federais de 1ª instância. Cada TRF cobre uma região geográfica do país — 6 tribunais com sede em Brasília, Rio, São Paulo, Porto Alegre, Recife e Belo Horizonte."
          facts={[
            { label: "Tribunais", value: "6 TRFs" },
            { label: "Desembargadores", value: "~135 no total" },
            { label: "Instância", value: "2ª instância federal" },
            { label: "Criados em", value: "1989 (CF/1988)" },
          ]}
          icon={SCALE_ICON}
          available={true}
          cta="Ver tribunais federais"
        />
      </div>

      {/* Appointment process */}
      <AppointmentProcess />

      {/* STF powers */}
      <STFPowers />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">Fonte: STF · Constituição Federal de 1988 · Lei 9.868/1999</p>
        <a
          href="https://portal.stf.jus.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          portal.stf.jus.br ↗
        </a>
      </div>
    </div>
  )
}
