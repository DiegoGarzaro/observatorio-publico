"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── Secretariat area data ────────────────────────────────────────────────────

interface SecretariatArea {
  area: string
  commonName: string
  responsibility: string
  budget: string
  color: string
}

const SECRETARIAT_AREAS: SecretariatArea[] = [
  {
    area: "Educação",
    commonName: "Secretaria de Estado da Educação (SEE / SEED / SEDUC)",
    responsibility: "Rede estadual de ensino fundamental (anos finais), ensino médio, EJA, educação especial e gestão de professores do estado.",
    budget: "Maior ou 2ª maior secretaria em todos os estados",
    color: "#60a5fa",
  },
  {
    area: "Saúde",
    commonName: "Secretaria de Estado da Saúde (SES / SESAB / SESA)",
    responsibility: "Hospitais estaduais, UPAs de referência, vigilância sanitária e epidemiológica, regulação do SUS estadual e gestão de leitos de média e alta complexidade.",
    budget: "Maior ou 2ª maior secretaria em todos os estados",
    color: "#34d399",
  },
  {
    area: "Segurança Pública",
    commonName: "Secretaria de Segurança Pública (SSP / SESP / SESEG)",
    responsibility: "Comanda a Polícia Militar, a Polícia Civil e, em alguns estados, a Polícia Técnico-Científica. Define política de segurança e integração das forças.",
    budget: "3ª ou 4ª maior secretaria na maioria dos estados",
    color: "#f87171",
  },
  {
    area: "Fazenda / Finanças",
    commonName: "Secretaria da Fazenda (SEFAZ / SEF / SEFA)",
    responsibility: "Arrecadação tributária (ICMS, IPVA, ITCMD), gestão orçamentária, dívida pública estadual, folha de pagamento e fiscalização fiscal.",
    budget: "Receita: principal fonte de recursos do estado",
    color: "#fbbf24",
  },
  {
    area: "Infraestrutura / Obras",
    commonName: "Secretaria de Infraestrutura (SEINFRA / SECTMA / DER)",
    responsibility: "Rodovias estaduais, obras públicas, habitação popular, saneamento básico e concessões de infraestrutura no âmbito estadual.",
    budget: "Volume alto de contratos e licitações",
    color: "#fb923c",
  },
  {
    area: "Administração / Gestão",
    commonName: "Secretaria de Administração (SAD / SEAD / SEGEP)",
    responsibility: "Gestão de pessoal (servidores estaduais), compras e contratações, tecnologia da informação, patrimônio imobiliário do estado e modernização administrativa.",
    budget: "Custo operacional da máquina pública",
    color: "#a78bfa",
  },
  {
    area: "Desenvolvimento Econômico",
    commonName: "Secretaria de Desenvolvimento Econômico (SDE / SEDEC / SEDET)",
    responsibility: "Atração de investimentos, política industrial, fomento ao empreendedorismo, turismo e negociação de incentivos fiscais para empresas.",
    budget: "Varia muito entre estados industriais e agrícolas",
    color: "#9ffe57",
  },
  {
    area: "Meio Ambiente",
    commonName: "Secretaria de Meio Ambiente (SEMA / SEMAC / SEMAR)",
    responsibility: "Licenciamento ambiental, fiscalização de desmatamento, gestão de unidades de conservação estaduais e política de mudanças climáticas.",
    budget: "Cresce com agenda climática e ESG",
    color: "#4ade80",
  },
]

// ─── Secretariat area card ────────────────────────────────────────────────────

function AreaCard({ area }: { area: SecretariatArea }) {
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ borderColor: `${area.color}25`, backgroundColor: `${area.color}06` }}
    >
      <div className="flex items-start gap-2">
        <div
          className="shrink-0 w-2 h-2 rounded-full mt-1.5"
          style={{ backgroundColor: area.color }}
        />
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-text-primary">{area.area}</p>
          <p className="text-[10px] font-medium" style={{ color: area.color }}>{area.commonName}</p>
        </div>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{area.responsibility}</p>
      <p className="text-[10px] text-text-muted border-t pt-2" style={{ borderColor: `${area.color}20` }}>
        {area.budget}
      </p>
    </div>
  )
}

// ─── Comparison table ─────────────────────────────────────────────────────────

function SecretaryVsMinister() {
  const rows = [
    { item: "Âmbito",           secretary: "Estadual",                              minister: "Federal" },
    { item: "Nomeação",         secretary: "Livre escolha do Governador",            minister: "Livre escolha do Presidente" },
    { item: "Mandato",          secretary: "Enquanto durar a confiança do Gov.",     minister: "Enquanto durar a confiança do Pres." },
    { item: "Subsídio",         secretary: "Até 75% do ministro federal (~R$ 34k)",  minister: "R$ 46.366/mês" },
    { item: "Exoneração",       secretary: "A qualquer momento, sem justificativa",  minister: "A qualquer momento, sem justificativa" },
    { item: "Fiscalização",     secretary: "Assembleia Legislativa",                 minister: "Congresso Nacional" },
    { item: "Responsabilidade", secretary: "TCE (Tribunal de Contas do Estado)",     minister: "TCU (Tribunal de Contas da União)" },
    { item: "Foro privilegiado",secretary: "TJ do estado (em regra)",                minister: "STF" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secretário estadual vs. ministro federal</CardTitle>
        <CardDescription className="mt-0.5">Estrutura equivalente em nível estadual e federal</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider w-1/4">Aspecto</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9ffe57" }}>
                Secretário Estadual
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#c084fc" }}>
                Ministro Federal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((r) => (
              <tr key={r.item} className="hover:bg-bg-raised transition-colors">
                <td className="py-2 px-3 font-semibold text-text-muted">{r.item}</td>
                <td className="py-2 px-3 text-text-secondary">{r.secretary}</td>
                <td className="py-2 px-3 text-text-secondary">{r.minister}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Structure section ────────────────────────────────────────────────────────

function GovernmentStructure() {
  const steps = [
    {
      title: "Governador",
      description: "Nomeia e exonera secretários livremente. Define as prioridades de governo e o tamanho do secretariado.",
      color: "#9ffe57",
    },
    {
      title: "Secretários de Estado",
      description: "Dirigem as secretarias, editam portarias, gerenciam orçamento setorial e respondem pelos resultados da pasta perante o Governador e a Assembleia.",
      color: "#fbbf24",
    },
    {
      title: "Subsecretários e Superintendentes",
      description: "Segundo escalão — coordenam áreas específicas dentro da secretaria (ex: Subsecretaria de Ensino Médio dentro da Secretaria de Educação).",
      color: "#fb923c",
    },
    {
      title: "Servidores de carreira",
      description: "Servidores efetivos (concursados) que executam as políticas independentemente de quem seja o secretário. Garantem continuidade administrativa.",
      color: "#60a5fa",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hierarquia interna do Executivo estadual</CardTitle>
        <CardDescription className="mt-0.5">Do Governador ao servidor de carreira</CardDescription>
      </CardHeader>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: `${step.color}18`, color: step.color, border: `1px solid ${step.color}40` }}
              >
                {i + 1}
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

// ─── SecretariasEstaduaisOverview ─────────────────────────────────────────────

export function SecretariasEstaduaisOverview() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            As Secretarias de Estado são o equivalente estadual dos ministérios federais. Cada secretaria é
            responsável por uma área de política pública no âmbito do estado — saúde, educação, segurança,
            fazenda, infraestrutura, entre outras. Os secretários são nomeados livremente pelo Governador,
            são de confiança política e podem ser exonerados a qualquer momento. O número de secretarias
            varia por estado: de ~10 nos menores até mais de 30 nos maiores (SP, MG, RJ).
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Nomeação</dt>
              <dd className="text-xs font-semibold text-text-primary">Livre escolha do Governador</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Mandato</dt>
              <dd className="text-xs font-semibold text-text-primary">Enquanto durar a confiança</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Subsídio máximo</dt>
              <dd className="text-xs font-semibold text-text-primary">~R$ 34.774/mês (75% do federal)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Fiscalização</dt>
              <dd className="text-xs font-semibold text-text-primary">Assembleia Legislativa + TCE</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Secretariat areas */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
          Principais áreas — presentes em todos os estados
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECRETARIAT_AREAS.map((area) => (
            <AreaCard key={area.area} area={area} />
          ))}
        </div>
      </div>

      {/* Hierarchy */}
      <GovernmentStructure />

      {/* Comparison */}
      <SecretaryVsMinister />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">
          Fonte: Constituição Federal art. 25 · Constituições Estaduais · portais dos governos estaduais
        </p>
        <a
          href="https://www.gov.br/governos-estaduais"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          gov.br ↗
        </a>
      </div>
    </div>
  )
}
