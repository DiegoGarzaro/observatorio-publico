"use client"

import Link from "next/link"
import { PoliticsHierarchy } from "@/components/features/politics-hierarchy"

function AnalysisCard({
  href,
  label,
  description,
  tag,
}: {
  href: string
  label: string
  description: string
  tag?: string
}) {
  return (
    <Link href={href} className="group block">
      <div
        className="rounded-xl border p-5 transition-all duration-200 group-hover:border-accent/40 group-hover:bg-accent/5"
        style={{ borderColor: "#1a2e1a", backgroundColor: "#0b140b" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {tag && (
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ color: "#9ffe57", backgroundColor: "rgba(159,254,87,0.1)" }}
              >
                {tag}
              </span>
            )}
            <p className="font-semibold text-text-primary">{label}</p>
            <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
          </div>
          <svg
            className="shrink-0 mt-1 text-text-muted group-hover:text-accent transition-colors"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Transparência Política
        </h1>
        <p className="text-text-secondary mt-2 max-w-xl">
          Dados abertos sobre representantes públicos brasileiros — gastos, votações e atuação legislativa.
        </p>
      </div>

      {/* Analyses */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">Análises</h2>
          <p className="text-text-secondary text-sm mt-0.5">Ferramentas para acompanhar e escolher seus representantes</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <AnalysisCard
            href="/eleicoes/2026"
            label="Eleições Gerais 2026"
            description="Cargos em disputa, histórico dos incumbentes e guia para uma escolha informada — 1º turno em 4 de outubro."
            tag="Eleições 2026"
          />
          <AnalysisCard
            href="/custos"
            label="Custos da Máquina Pública"
            description="Verba dos deputados, salários, cartão corporativo e emendas parlamentares — mês a mês."
            tag="Dados disponíveis"
          />
        </div>
      </section>

      {/* Politics hierarchy */}
      <PoliticsHierarchy />
    </div>
  )
}
