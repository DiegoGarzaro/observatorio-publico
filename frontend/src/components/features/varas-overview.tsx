"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── Vara type data ───────────────────────────────────────────────────────────

interface VaraType {
  name: string
  sphere: "Estadual" | "Federal" | "Ambas"
  description: string
  examples: string
  color: string
}

const VARA_TYPES: VaraType[] = [
  {
    name: "Vara Cível",
    sphere: "Estadual",
    description: "Julga conflitos patrimoniais entre particulares: contratos, cobranças, indenizações, posse e propriedade de bens.",
    examples: "Ação de cobrança, rescisão contratual, indenização por dano moral, reintegração de posse",
    color: "#60a5fa",
  },
  {
    name: "Vara Criminal",
    sphere: "Estadual",
    description: "Julga crimes comuns previstos no Código Penal e legislação estadual que não sejam de competência federal ou especializada.",
    examples: "Furto, roubo, homicídio culposo, lesão corporal, estelionato entre particulares",
    color: "#f87171",
  },
  {
    name: "Vara de Família",
    sphere: "Estadual",
    description: "Cuida de relações familiares e sucessórias: divórcio, guarda, alimentos, adoção, inventário e tutela.",
    examples: "Divórcio litigioso, regulamentação de visitas, ação de alimentos, inventário judicial",
    color: "#fb923c",
  },
  {
    name: "Vara da Fazenda Pública",
    sphere: "Estadual",
    description: "Julga ações entre cidadãos e os governos estadual e municipal: tributos estaduais, servidores públicos e responsabilidade do Estado.",
    examples: "Mandado de segurança contra ato municipal, ação de cobrança de IPTU, ressarcimento por dano do Estado",
    color: "#fbbf24",
  },
  {
    name: "Vara Federal",
    sphere: "Federal",
    description: "Julga em 1ª instância causas que envolvam a União, autarquias federais e crimes federais. Vinculada ao TRF da região.",
    examples: "Benefício previdenciário (INSS), crime de tráfico internacional, ação contra a Receita Federal",
    color: "#818cf8",
  },
  {
    name: "Vara do Trabalho",
    sphere: "Federal",
    description: "Julga conflitos entre empregados e empregadores. Pertence à Justiça do Trabalho — vinculada ao TRT da região.",
    examples: "Reclamação trabalhista, horas extras, demissão sem justa causa, acidente de trabalho",
    color: "#34d399",
  },
  {
    name: "Zona Eleitoral",
    sphere: "Federal",
    description: "Unidade básica da Justiça Eleitoral. Realiza o cadastramento de eleitores, registra candidaturas locais e apura eleições municipais.",
    examples: "Transferência de domicílio eleitoral, registro de candidatura a vereador, diplomação de eleitos",
    color: "#a78bfa",
  },
  {
    name: "Vara de Execuções Penais",
    sphere: "Ambas",
    description: "Supervisiona o cumprimento das penas após a condenação: progressão de regime, livramento condicional, remição de pena.",
    examples: "Pedido de progressão ao regime semiaberto, autorização de saída temporária, extinção da pena",
    color: "#c084fc",
  },
]

// ─── Vara type card ───────────────────────────────────────────────────────────

function VaraCard({ vara }: { vara: VaraType }) {
  const sphereColors: Record<VaraType["sphere"], string> = {
    "Estadual": "#9ffe57",
    "Federal":  "#57c4ff",
    "Ambas":    "#fbbf24",
  }

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ borderColor: `${vara.color}25`, backgroundColor: `${vara.color}06` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-text-primary">{vara.name}</p>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${sphereColors[vara.sphere]}14`, color: sphereColors[vara.sphere] }}
          >
            {vara.sphere}
          </span>
        </div>
        <div className="shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: vara.color }} />
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{vara.description}</p>
      <div className="border-t pt-2 space-y-0.5" style={{ borderColor: `${vara.color}20` }}>
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Casos típicos</p>
        <p className="text-xs text-text-muted leading-relaxed">{vara.examples}</p>
      </div>
    </div>
  )
}

// ─── Judge appointment ────────────────────────────────────────────────────────

function JudgeAppointment() {
  const steps = [
    {
      title: "Concurso público",
      description: "Todo juiz de 1ª instância — federal ou estadual — ingressa obrigatoriamente por concurso público de provas e títulos, organizado pelo próprio tribunal. A CF veda o nepotismo e exige 3 anos de atividade jurídica.",
      color: "#9ffe57",
    },
    {
      title: "Estágio probatório",
      description: "Juiz substituto por 2 anos sob avaliação de desempenho, produtividade, assiduidade e conduta. Somente após aprovação adquire vitaliciedade.",
      color: "#fbbf24",
    },
    {
      title: "Vitaliciedade",
      description: "Após 2 anos no cargo, o juiz só pode perder o cargo por sentença judicial transitada em julgado — não pode ser demitido por ato administrativo do tribunal ou do Executivo.",
      color: "#fb923c",
    },
    {
      title: "Promoção por antiguidade ou mérito",
      description: "Juízes sobem para varas de maior complexidade e eventualmente para tribunais (TJ/TRF) por alternância entre critérios de antiguidade e merecimento, votados pelo pleno do tribunal.",
      color: "#60a5fa",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como um juiz chega ao cargo</CardTitle>
        <CardDescription className="mt-0.5">Do concurso à vitaliciedade</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-3">
            <div
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-0.5"
              style={{ backgroundColor: `${step.color}18`, color: step.color, border: `1px solid ${step.color}40` }}
            >
              {i + 1}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">{step.title}</p>
              <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Federal vs state ─────────────────────────────────────────────────────────

function FederalVsState() {
  const rows = [
    { item: "Esfera",         state: "Estadual",                           federal: "Federal" },
    { item: "Causas típicas", state: "Particulares, crimes comuns",        federal: "União, INSS, Receita, crimes federais" },
    { item: "2ª instância",   state: "Tribunal de Justiça (TJ)",           federal: "Tribunal Regional Federal (TRF)" },
    { item: "Cúpula",         state: "STJ (lei federal) · STF (CF)",       federal: "STJ (lei federal) · STF (CF)" },
    { item: "Ingresso",       state: "Concurso estadual (TJ organiza)",    federal: "Concurso federal (TRF/CJF organiza)" },
    { item: "Subsídio inicial",state: "~R$ 24.000–R$ 30.000/mês",          federal: "~R$ 28.884/mês (entrância inicial)" },
    { item: "Número",         state: "~13.000 varas estaduais",            federal: "~1.700 varas e juízos federais" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vara estadual vs. vara federal</CardTitle>
        <CardDescription className="mt-0.5">Quando o processo vai para cada esfera</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider w-1/4">Aspecto</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9ffe57" }}>Vara Estadual</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#818cf8" }}>Vara Federal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((r) => (
              <tr key={r.item} className="hover:bg-bg-raised transition-colors">
                <td className="py-2 px-3 font-semibold text-text-muted">{r.item}</td>
                <td className="py-2 px-3 text-text-secondary">{r.state}</td>
                <td className="py-2 px-3 text-text-secondary">{r.federal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── CNJ oversight ────────────────────────────────────────────────────────────

function CNJRole() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>O papel do CNJ</CardTitle>
        <CardDescription className="mt-0.5">Conselho Nacional de Justiça — controle da atividade judicial</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { title: "Corregedoria", desc: "Fiscaliza a conduta de juízes e servidores. Pode instaurar sindicâncias e processos administrativos disciplinares contra magistrados de qualquer tribunal." },
          { title: "Metas de produtividade", desc: "Define metas anuais de julgamento para todos os tribunais. O cumprimento é público e influencia a distribuição de recursos do orçamento do Judiciário." },
          { title: "Transparência", desc: "Mantém o DataJud (base nacional de processos) e o Portal CNJ, onde qualquer cidadão pode consultar estatísticas de produtividade por vara e por juiz." },
          { title: "Resoluções normativas", desc: "Edita resoluções que uniformizam procedimentos em todos os tribunais — como prazos, formatos de autuação, audiências por videoconferência e gestão de acervos." },
        ].map((item) => (
          <div key={item.title} className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: "#c084fc08", border: "1px solid #c084fc20" }}>
            <div className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: "#c084fc" }} />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-text-primary">{item.title}</p>
              <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── VarasOverview ────────────────────────────────────────────────────────────

export function VarasOverview() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            As varas de 1ª instância são o ponto de entrada do sistema judicial — onde os processos começam.
            É aqui que os fatos são provados, as testemunhas são ouvidas e a primeira sentença é dada. O Brasil
            tem cerca de 15.000 varas e juízos distribuídos por mais de 1.500 comarcas e seções judiciárias.
            Cada vara é presidida por um juiz de direito (estadual) ou juiz federal, concursados e com
            vitaliciedade após 2 anos no cargo.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Varas estaduais</dt>
              <dd className="text-xs font-semibold text-text-primary">~13.000 em todo o Brasil</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Varas federais</dt>
              <dd className="text-xs font-semibold text-text-primary">~1.700 varas e juízos</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Ingresso</dt>
              <dd className="text-xs font-semibold text-text-primary">Concurso público obrigatório</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Fiscalização</dt>
              <dd className="text-xs font-semibold text-text-primary">CNJ + Corregedorias dos TJs/TRFs</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Vara types */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Tipos de vara por especialidade</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VARA_TYPES.map((vara) => (
            <VaraCard key={vara.name} vara={vara} />
          ))}
        </div>
      </div>

      {/* Judge appointment */}
      <JudgeAppointment />

      {/* Federal vs state */}
      <FederalVsState />

      {/* CNJ */}
      <CNJRole />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">
          Fonte: CNJ · Constituição Federal art. 93–95 · CPC art. 42–69 · Relatório Justiça em Números CNJ
        </p>
        <a
          href="https://www.cnj.jus.br/pesquisas-judiciarias/justica-em-numeros"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          Justiça em Números ↗
        </a>
      </div>
    </div>
  )
}
