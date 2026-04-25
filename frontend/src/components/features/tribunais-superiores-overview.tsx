"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── Shared icon ──────────────────────────────────────────────────────────────

const SCALE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3v18M3 9l9-6 9 6M5 20h14" />
    <path d="M5 12l-2 5h4L5 12zM19 12l-2 5h4L19 12z" />
  </svg>
)

// ─── Tribunal card ────────────────────────────────────────────────────────────

interface TribunalCardProps {
  color: string
  acronym: string
  fullName: string
  subtitle: string
  description: string
  facts: { label: string; value: string }[]
  powers: string[]
}

function TribunalCard({ color, acronym, fullName, subtitle, description, facts, powers }: TribunalCardProps) {
  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}06` }}
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{SCALE_ICON}</span>
          <h2 className="text-base font-bold text-text-primary">{fullName}</h2>
        </div>
        <p className="text-xs font-semibold" style={{ color }}>{acronym} · {subtitle}</p>
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

      {/* Powers */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Competências principais</p>
        <ul className="space-y-1.5">
          {powers.map((p) => (
            <li key={p} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="mt-0.5 shrink-0" style={{ color }}>›</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Composition section ──────────────────────────────────────────────────────

function AppointmentComparison() {
  const rows = [
    {
      tribunal: "STJ",
      total: "33",
      origin: "1/3 TRFs · 1/3 TJs · 1/3 OAB/MP",
      mandate: "Vitalício até 75 anos",
      quorum: "2/3 (22) para instalação",
    },
    {
      tribunal: "TSE",
      total: "7",
      origin: "3 do STF · 2 do STJ · 2 advogados",
      mandate: "2 anos (renovável 1x)",
      quorum: "4 para sessão plenária",
    },
    {
      tribunal: "STM",
      total: "15",
      origin: "4 Exército · 3 Marinha · 3 Aeronáutica · 5 civis",
      mandate: "Vitalício até 75 anos",
      quorum: "8 para sessão plenária",
    },
    {
      tribunal: "TST",
      total: "27",
      origin: "1/5 OAB/MP · 4/5 magistratura trabalhista",
      mandate: "Vitalício até 75 anos",
      quorum: "14 para sessão plenária",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composição comparada</CardTitle>
        <CardDescription className="mt-0.5">Origem, tamanho e mandato de cada tribunal</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              {["Tribunal", "Membros", "Origem", "Mandato", "Quórum"].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((r) => (
              <tr key={r.tribunal} className="hover:bg-bg-raised transition-colors">
                <td className="py-2.5 px-3 font-bold text-text-primary">{r.tribunal}</td>
                <td className="py-2.5 px-3 text-text-secondary tabular-nums">{r.total}</td>
                <td className="py-2.5 px-3 text-text-secondary">{r.origin}</td>
                <td className="py-2.5 px-3 text-text-secondary whitespace-nowrap">{r.mandate}</td>
                <td className="py-2.5 px-3 text-text-secondary">{r.quorum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Hierarchy section ────────────────────────────────────────────────────────

function JudiciaryHierarchy() {
  const levels = [
    {
      label: "STF",
      description: "Supremo Tribunal Federal — guarda da Constituição e última instância",
      color: "#c084fc",
    },
    {
      label: "STJ · TSE · STM · TST",
      description: "Tribunais superiores — últimas instâncias de suas especialidades",
      color: "#a78bfa",
    },
    {
      label: "TRFs · TRTs · TREs · TJMs",
      description: "Tribunais de 2ª instância — revisão de decisões de 1ª instância",
      color: "#818cf8",
    },
    {
      label: "Juízos de 1ª Instância",
      description: "Varas federais, trabalhistas, eleitorais e militares",
      color: "#6366f1",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onde estes tribunais se encaixam</CardTitle>
        <CardDescription className="mt-0.5">Hierarquia do Poder Judiciário federal</CardDescription>
      </CardHeader>
      <div className="space-y-2">
        {levels.map((level, i) => (
          <div
            key={level.label}
            className="flex items-start gap-3 rounded-lg px-4 py-3"
            style={{
              backgroundColor: `${level.color}08`,
              border: `1px solid ${level.color}25`,
              marginLeft: `${i * 1.25}rem`,
            }}
          >
            <div
              className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
              style={{ backgroundColor: level.color }}
            />
            <div>
              <p className="text-xs font-bold" style={{ color: level.color }}>{level.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{level.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── TribunaisSuperioresOverview ───────────────────────────────────────────────

export function TribunaisSuperioresOverview() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            Os tribunais superiores são a cúpula das Justiças especializadas do Brasil. Cada um julga
            em última instância sua área de competência: o STJ unifica a interpretação da lei federal,
            o TSE rege as eleições, o STM julga crimes militares e o TST decide os conflitos do trabalho.
            Nenhum deles pode questionar a Constituição — isso é prerrogativa exclusiva do STF.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Total de ministros</dt>
              <dd className="text-xs font-semibold text-text-primary">82 (STJ 33 · TST 27 · STM 15 · TSE 7)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Subsídio</dt>
              <dd className="text-xs font-semibold text-text-primary">~R$ 44.047/mês (95% do STF)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Mandato geral</dt>
              <dd className="text-xs font-semibold text-text-primary">Vitalício até 75 anos</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Sede</dt>
              <dd className="text-xs font-semibold text-text-primary">Brasília / DF</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Court cards — 2×2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TribunalCard
          color="#a78bfa"
          acronym="STJ"
          fullName="Superior Tribunal de Justiça"
          subtitle="uniformiza a lei federal"
          description="Última instância para causas de direito federal que não envolvam questão constitucional. Garante que a lei federal seja interpretada de forma uniforme em todo o país, evitando decisões contraditórias entre os tribunais estaduais e federais."
          facts={[
            { label: "Membros", value: "33 ministros" },
            { label: "Mandato", value: "Vitalício até 75 anos" },
            { label: "Seções", value: "3 seções especializadas" },
            { label: "Recurso cabível", value: "Recurso Especial (REsp)" },
          ]}
          powers={[
            "Julgar REsp — unificar interpretação da lei federal",
            "Processar governadores por crimes comuns",
            "Julgar conflitos de competência entre TJs e TRFs",
            "Homologar sentenças estrangeiras (após STF delegar em 2004)",
          ]}
        />

        <TribunalCard
          color="#818cf8"
          acronym="TSE"
          fullName="Tribunal Superior Eleitoral"
          subtitle="órgão máximo da Justiça Eleitoral"
          description="Regula e fiscaliza as eleições no Brasil. Registra partidos políticos e candidaturas, diploma eleitos, julga recursos eleitorais e pode cassar mandatos por abuso de poder econômico ou uso indevido dos meios de comunicação."
          facts={[
            { label: "Membros", value: "7 ministros" },
            { label: "Mandato", value: "2 anos (renovável 1x)" },
            { label: "Composição", value: "3 STF · 2 STJ · 2 advogados" },
            { label: "Presidente", value: "Sempre um ministro do STF" },
          ]}
          powers={[
            "Regulamentar eleições, partidos e propaganda eleitoral",
            "Registrar e diplomar candidatos eleitos",
            "Cassar mandatos por captação ilícita de sufrágio",
            "Julgar recursos contra decisões dos TREs",
          ]}
        />

        <TribunalCard
          color="#6366f1"
          acronym="STM"
          fullName="Superior Tribunal Militar"
          subtitle="Justiça Militar federal"
          description="O mais antigo tribunal do Brasil (criado em 1808 por Dom João VI). Julga em última instância os crimes militares praticados por militares das Forças Armadas. É o único tribunal superior com composição mista: militares da ativa e civis."
          facts={[
            { label: "Membros", value: "15 ministros" },
            { label: "Mandato", value: "Vitalício até 75 anos" },
            { label: "Militares", value: "10 (4 Exército · 3 Marinha · 3 FAB)" },
            { label: "Civis", value: "5 (3 advogados · 1 juiz · 1 MP)" },
          ]}
          powers={[
            "Julgar recursos de decisões da Justiça Militar de 1ª instância",
            "Processar militares de alta patente (generais, almirantes) por crimes militares",
            "Decretar perda de posto e patente de oficial",
            "Julgar civis por crimes contra a segurança nacional em tempo de paz",
          ]}
        />

        <TribunalCard
          color="#4f46e5"
          acronym="TST"
          fullName="Tribunal Superior do Trabalho"
          subtitle="última instância trabalhista"
          description="Órgão de cúpula da Justiça do Trabalho. Unifica a jurisprudência trabalhista e garante a aplicação uniforme da CLT e demais normas de direito do trabalho em todo o país. Julga os recursos das decisões dos 24 Tribunais Regionais do Trabalho."
          facts={[
            { label: "Membros", value: "27 ministros" },
            { label: "Mandato", value: "Vitalício até 75 anos" },
            { label: "TRTs subordinados", value: "24 tribunais regionais" },
            { label: "Recurso cabível", value: "Recurso de Revista (RR)" },
          ]}
          powers={[
            "Unificar jurisprudência trabalhista via Súmulas e OJs",
            "Julgar Recurso de Revista e Embargos de Divergência",
            "Processar dissídios coletivos de categorias nacionais",
            "Fiscalizar cumprimento das normas de saúde e segurança do trabalho",
          ]}
        />
      </div>

      {/* Composition table */}
      <AppointmentComparison />

      {/* Hierarchy */}
      <JudiciaryHierarchy />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">Fonte: STJ · TSE · STM · TST · Constituição Federal de 1988</p>
        <a
          href="https://www.stj.jus.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          stj.jus.br ↗
        </a>
      </div>
    </div>
  )
}
