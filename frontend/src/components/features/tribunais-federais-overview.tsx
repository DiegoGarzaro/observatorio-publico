"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── TRF card ─────────────────────────────────────────────────────────────────

interface TRFCardProps {
  number: number
  city: string
  states: string[]
  judges: number
  color: string
  founded: number
  facts: { label: string; value: string }[]
}

function TRFCard({ number, city, states, judges, color, founded, facts }: TRFCardProps) {
  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}06` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}40` }}
            >
              {number}
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">TRF{number}</p>
              <p className="text-xs font-medium" style={{ color }}>{city}</p>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-text-primary tabular-nums">{judges}</p>
          <p className="text-[10px] text-text-muted">desembargadores</p>
        </div>
      </div>

      {/* States */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Jurisdição</p>
        <div className="flex flex-wrap gap-1">
          {states.map((uf) => (
            <span
              key={uf}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${color}14`, color }}
            >
              {uf}
            </span>
          ))}
        </div>
      </div>

      {/* Facts */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3" style={{ borderColor: `${color}20` }}>
        <div className="space-y-0.5">
          <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Criado em</dt>
          <dd className="text-xs font-semibold text-text-primary">{founded}</dd>
        </div>
        {facts.map((f) => (
          <div key={f.label} className="space-y-0.5">
            <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{f.label}</dt>
            <dd className="text-xs font-semibold text-text-primary">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ─── Competencies section ─────────────────────────────────────────────────────

function Competencies() {
  const categories = [
    {
      title: "O que os TRFs julgam",
      items: [
        "Apelações e agravos contra decisões de juízes federais de 1ª instância",
        "Mandados de segurança, habeas corpus e habeas data contra ato de juiz federal",
        "Disputas entre União, autarquias federais (INSS, Receita, IBAMA) e cidadãos",
        "Crimes federais em 2ª instância (tráfico internacional, crimes contra a União)",
        "Litígios de servidores federais contra a Administração Pública",
      ],
    },
    {
      title: "O que NÃO é competência federal",
      items: [
        "Causas entre particulares sem envolvimento da União ou autarquias — vai para a Justiça Estadual",
        "Questões trabalhistas — competência da Justiça do Trabalho (TRTs/TST)",
        "Crimes eleitorais — competência da Justiça Eleitoral (TREs/TSE)",
        "Crimes militares — competência da Justiça Militar (TJMs/STM)",
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <Card key={cat.title}>
          <CardHeader>
            <CardTitle>{cat.title}</CardTitle>
          </CardHeader>
          <ul className="space-y-2 text-sm text-text-secondary">
            {cat.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent mt-0.5 shrink-0">›</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}

// ─── Flow section ─────────────────────────────────────────────────────────────

function JudiciaryFlow() {
  const steps = [
    {
      number: "1ª",
      title: "Vara Federal",
      description: "O processo começa na Vara Federal da cidade. O juiz federal de 1ª instância instrui e julga o caso.",
      color: "#57c4ff",
    },
    {
      number: "2ª",
      title: "TRF (Tribunal Regional Federal)",
      description: "Se a parte recorrer, o processo sobe ao TRF da região. O colegiado de desembargadores federais revisa a decisão.",
      color: "#818cf8",
    },
    {
      number: "3ª",
      title: "STJ ou TST",
      description: "Questão de direito federal infraconstitucional → STJ via Recurso Especial. Questão trabalhista federal → TST via Recurso de Revista.",
      color: "#a78bfa",
    },
    {
      number: "4ª",
      title: "STF",
      description: "Se houver questão constitucional, o caso pode chegar ao STF via Recurso Extraordinário — última instância possível.",
      color: "#c084fc",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caminho de um processo federal</CardTitle>
        <CardDescription className="mt-0.5">Da 1ª instância até a cúpula do Judiciário</CardDescription>
      </CardHeader>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.number} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="shrink-0 flex items-center justify-center w-9 h-7 rounded-md text-[11px] font-bold"
                style={{ backgroundColor: `${step.color}18`, color: step.color, border: `1px solid ${step.color}40` }}
              >
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 my-1" style={{ backgroundColor: `${step.color}30` }} />
              )}
            </div>
            <div className="pb-3 space-y-0.5">
              <p className="text-sm font-semibold text-text-primary">{step.title}</p>
              <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── TribunaisFederaisOverview ─────────────────────────────────────────────────

const TRF_DATA: Omit<TRFCardProps, "color">[] = [
  {
    number: 1,
    city: "Brasília / DF",
    states: ["AC", "AM", "AP", "BA", "DF", "GO", "MA", "MT", "PA", "PI", "RO", "RR", "TO"],
    judges: 27,
    founded: 1989,
    facts: [
      { label: "Maior jurisdição", value: "13 UFs + DF" },
      { label: "1ª instância", value: "Subseções Judiciárias" },
    ],
  },
  {
    number: 2,
    city: "Rio de Janeiro / RJ",
    states: ["RJ", "ES"],
    judges: 27,
    founded: 1989,
    facts: [
      { label: "Jurisdição", value: "2 UFs" },
      { label: "Destaque", value: "Causas de grande repercussão" },
    ],
  },
  {
    number: 3,
    city: "São Paulo / SP",
    states: ["SP", "MS"],
    judges: 27,
    founded: 1989,
    facts: [
      { label: "Jurisdição", value: "2 UFs" },
      { label: "Maior volume", value: "Mais processos do país" },
    ],
  },
  {
    number: 4,
    city: "Porto Alegre / RS",
    states: ["PR", "SC", "RS"],
    judges: 27,
    founded: 1989,
    facts: [
      { label: "Jurisdição", value: "3 UFs — Sul do Brasil" },
      { label: "Destaque", value: "Operação Lava Jato (2014–)" },
    ],
  },
  {
    number: 5,
    city: "Recife / PE",
    states: ["AL", "CE", "PB", "PE", "RN", "SE"],
    judges: 15,
    founded: 1989,
    facts: [
      { label: "Jurisdição", value: "6 UFs — Nordeste" },
      { label: "1ª instância", value: "Seções Judiciárias" },
    ],
  },
  {
    number: 6,
    city: "Belo Horizonte / MG",
    states: ["MG"],
    judges: 12,
    founded: 2023,
    facts: [
      { label: "Desmembrado de", value: "TRF1 (Lei 14.236/2021)" },
      { label: "Status", value: "Mais recente do país" },
    ],
  },
]

const COLORS = ["#57c4ff", "#9ffe57", "#ffd557", "#a78bfa", "#fb923c", "#34d399"]

export function TribunaisFederaisOverview() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            Os Tribunais Regionais Federais (TRFs) são a 2ª instância da Justiça Federal. Julgam recursos
            contra decisões dos juízes federais de 1ª instância em causas que envolvem a União, autarquias
            e empresas públicas federais. O Brasil tem 6 TRFs, cada um cobrindo uma região geográfica. Suas
            decisões podem ser revistas pelo STJ (em questão de lei federal) ou pelo STF (em questão constitucional).
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Tribunais</dt>
              <dd className="text-xs font-semibold text-text-primary">6 TRFs (TRF1 a TRF6)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Desembargadores</dt>
              <dd className="text-xs font-semibold text-text-primary">~135 no total</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Instância</dt>
              <dd className="text-xs font-semibold text-text-primary">2ª instância federal</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Criados em</dt>
              <dd className="text-xs font-semibold text-text-primary">1989 (CF/1988 · art. 107)</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* TRF cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TRF_DATA.map((trf, i) => (
          <TRFCard key={trf.number} {...trf} color={COLORS[i]} />
        ))}
      </div>

      {/* Competencies */}
      <Competencies />

      {/* Flow */}
      <JudiciaryFlow />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">
          Fonte: Constituição Federal art. 107–110 · CJF · Lei 14.236/2021 (criação do TRF6)
        </p>
        <a
          href="https://www.cjf.jus.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          cjf.jus.br ↗
        </a>
      </div>
    </div>
  )
}
