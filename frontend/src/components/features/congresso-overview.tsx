"use client"

import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── Chamber card ─────────────────────────────────────────────────────────────

interface ChamberCardProps {
  href: string
  color: string
  title: string
  subtitle: string
  description: string
  facts: { label: string; value: string }[]
  icon: React.ReactNode
}

function ChamberCard({ href, color, title, subtitle, description, facts, icon }: ChamberCardProps) {
  return (
    <Link href={href} className="block group">
      <div
        className="rounded-xl border p-5 space-y-4 transition-all duration-200 group-hover:shadow-md h-full"
        style={{
          borderColor: `${color}30`,
          backgroundColor: `${color}06`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${color}60`
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = `${color}0e`
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${color}30`
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = `${color}06`
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span style={{ color }}>{icon}</span>
              <h2 className="text-base font-bold text-text-primary">{title}</h2>
            </div>
            <p className="text-xs font-medium" style={{ color }}>{subtitle}</p>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="shrink-0 mt-0.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>

        {/* Facts */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4" style={{ borderColor: `${color}20` }}>
          {facts.map((f) => (
            <div key={f.label} className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{f.label}</dt>
              <dd className="text-xs font-semibold text-text-primary">{f.value}</dd>
            </div>
          ))}
        </dl>

        {/* CTA */}
        <p className="text-xs font-medium transition-colors" style={{ color }}>
          Ver todos os {title.toLowerCase()} →
        </p>
      </div>
    </Link>
  )
}

// ─── How it works section ─────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Câmara inicia",
      description: "A maioria dos projetos de lei começa na Câmara dos Deputados, que representa o povo proporcionalmente.",
    },
    {
      number: "2",
      title: "Senado revisa",
      description: "O Senado, que representa os estados com poder igualitário, revisa e aprova, rejeita ou emenda o projeto.",
    },
    {
      number: "3",
      title: "Presidente sanciona",
      description: "Com aprovação das duas casas, o projeto vai ao Presidente, que sanciona (vira lei) ou veta.",
    },
    {
      number: "4",
      title: "Congresso pode derrubar veto",
      description: "Se o Presidente vetar, o Congresso Nacional reunido pode derrubar o veto por maioria absoluta.",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como uma lei é aprovada</CardTitle>
        <CardDescription className="mt-0.5">O caminho de um projeto até virar lei</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            <div
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-0.5"
              style={{ backgroundColor: "#9ffe5718", color: "#9ffe57", border: "1px solid #9ffe5740" }}
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

// ─── Powers section ───────────────────────────────────────────────────────────

function ExclusivePowers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Poderes exclusivos da Câmara</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Autorizar o impeachment do Presidente (2/3 dos votos)",
            "Iniciar projetos de lei sobre o Orçamento da União",
            "Fiscalizar e controlar atos do Poder Executivo",
            "Eleger membros do Conselho da República",
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
          <CardTitle>Poderes exclusivos do Senado</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Julgar o Presidente em crimes de responsabilidade",
            "Aprovar nomeações para STF, PGR e cargos diplomáticos",
            "Autorizar empréstimos externos de estados e municípios",
            "Fixar os limites globais da dívida pública",
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

// ─── CongressoOverview ────────────────────────────────────────────────────────

export function CongressoOverview() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            O Congresso Nacional é o Poder Legislativo federal do Brasil — o órgão responsável por fazer as leis do país,
            aprovar o orçamento federal e fiscalizar os gastos do governo. É bicameral: formado por duas casas independentes
            que precisam chegar a acordo para aprovar qualquer legislação.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Total de parlamentares</dt>
              <dd className="text-xs font-semibold text-text-primary">594 (513 + 81)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Legislatura atual</dt>
              <dd className="text-xs font-semibold text-text-primary">57ª (2023–2027)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Subsídio bruto</dt>
              <dd className="text-xs font-semibold text-text-primary">R$ 46.366/mês</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Sede</dt>
              <dd className="text-xs font-semibold text-text-primary">Congresso Nacional · Brasília/DF</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Two chambers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChamberCard
          href="/deputados"
          color="#57c4ff"
          title="Câmara dos Deputados"
          subtitle="Câmara baixa · representa o povo"
          description="Cada estado elege deputados proporcionalmente à sua população. É aqui que a maioria dos projetos de lei começa. A Câmara também tem o poder de autorizar o impeachment do Presidente."
          facts={[
            { label: "Membros", value: "513 deputados" },
            { label: "Mandato", value: "4 anos · ilimitado" },
            { label: "Eleição", value: "Proporcional por estado" },
            { label: "Mín. por estado", value: "8 deputados" },
          ]}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 20h20M4 20V10l8-6 8 6v10M9 20v-6h6v6" />
            </svg>
          }
        />
        <ChamberCard
          href="/senadores"
          color="#9ffe57"
          title="Senado Federal"
          subtitle="Câmara alta · representa os estados"
          description="Cada estado tem exatamente 3 senadores, independentemente de sua população — o que garante equilíbrio entre estados grandes e pequenos. O Senado julga o Presidente em crimes de responsabilidade."
          facts={[
            { label: "Membros", value: "81 senadores" },
            { label: "Mandato", value: "8 anos (2 legislaturas)" },
            { label: "Eleição", value: "Maioria simples · 1 turno" },
            { label: "Por estado", value: "3 senadores fixos" },
          ]}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 20h20M4 20V10l8-6 8 6v10M9 20v-6h6v6" />
            </svg>
          }
        />
      </div>

      {/* How a law works */}
      <HowItWorks />

      {/* Exclusive powers */}
      <ExclusivePowers />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">Fonte: Câmara dos Deputados · Senado Federal · Constituição Federal de 1988</p>
        <a
          href="https://www.congressonacional.leg.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          congressonacional.leg.br ↗
        </a>
      </div>
    </div>
  )
}
