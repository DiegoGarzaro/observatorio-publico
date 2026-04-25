"use client"

import React from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── TJ data ──────────────────────────────────────────────────────────────────

interface TJData {
  uf: string
  state: string
  acronym: string
  capital: string
  judges: number
  region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul"
  note?: string
}

const TJS: TJData[] = [
  // Norte
  { uf: "AC", state: "Acre",             acronym: "TJAC",  capital: "Rio Branco",     judges: 10,  region: "Norte" },
  { uf: "AM", state: "Amazonas",         acronym: "TJAM",  capital: "Manaus",          judges: 25,  region: "Norte" },
  { uf: "AP", state: "Amapá",            acronym: "TJAP",  capital: "Macapá",          judges: 10,  region: "Norte" },
  { uf: "PA", state: "Pará",             acronym: "TJPA",  capital: "Belém",           judges: 30,  region: "Norte" },
  { uf: "RO", state: "Rondônia",         acronym: "TJRO",  capital: "Porto Velho",     judges: 15,  region: "Norte" },
  { uf: "RR", state: "Roraima",          acronym: "TJRR",  capital: "Boa Vista",       judges: 8,   region: "Norte" },
  { uf: "TO", state: "Tocantins",        acronym: "TJTO",  capital: "Palmas",          judges: 15,  region: "Norte" },
  // Nordeste
  { uf: "AL", state: "Alagoas",          acronym: "TJAL",  capital: "Maceió",          judges: 20,  region: "Nordeste" },
  { uf: "BA", state: "Bahia",            acronym: "TJBA",  capital: "Salvador",        judges: 42,  region: "Nordeste" },
  { uf: "CE", state: "Ceará",            acronym: "TJCE",  capital: "Fortaleza",       judges: 36,  region: "Nordeste" },
  { uf: "MA", state: "Maranhão",         acronym: "TJMA",  capital: "São Luís",        judges: 25,  region: "Nordeste" },
  { uf: "PB", state: "Paraíba",          acronym: "TJPB",  capital: "João Pessoa",     judges: 30,  region: "Nordeste" },
  { uf: "PE", state: "Pernambuco",       acronym: "TJPE",  capital: "Recife",          judges: 36,  region: "Nordeste" },
  { uf: "PI", state: "Piauí",            acronym: "TJPI",  capital: "Teresina",        judges: 25,  region: "Nordeste" },
  { uf: "RN", state: "Rio Grande do Norte", acronym: "TJRN", capital: "Natal",         judges: 25,  region: "Nordeste" },
  { uf: "SE", state: "Sergipe",          acronym: "TJSE",  capital: "Aracaju",         judges: 20,  region: "Nordeste" },
  // Centro-Oeste
  { uf: "DF", state: "Distrito Federal", acronym: "TJDFT", capital: "Brasília",        judges: 30,  region: "Centro-Oeste", note: "Custeado pela União (único caso)" },
  { uf: "GO", state: "Goiás",            acronym: "TJGO",  capital: "Goiânia",         judges: 36,  region: "Centro-Oeste" },
  { uf: "MS", state: "Mato Grosso do Sul", acronym: "TJMS", capital: "Campo Grande",   judges: 23,  region: "Centro-Oeste" },
  { uf: "MT", state: "Mato Grosso",      acronym: "TJMT",  capital: "Cuiabá",          judges: 25,  region: "Centro-Oeste" },
  // Sudeste
  { uf: "ES", state: "Espírito Santo",   acronym: "TJES",  capital: "Vitória",         judges: 25,  region: "Sudeste" },
  { uf: "MG", state: "Minas Gerais",     acronym: "TJMG",  capital: "Belo Horizonte",  judges: 140, region: "Sudeste" },
  { uf: "RJ", state: "Rio de Janeiro",   acronym: "TJRJ",  capital: "Rio de Janeiro",  judges: 180, region: "Sudeste" },
  { uf: "SP", state: "São Paulo",        acronym: "TJSP",  capital: "São Paulo",       judges: 360, region: "Sudeste", note: "Maior tribunal do mundo em volume processual" },
  // Sul
  { uf: "PR", state: "Paraná",           acronym: "TJPR",  capital: "Curitiba",        judges: 42,  region: "Sul" },
  { uf: "RS", state: "Rio Grande do Sul", acronym: "TJRS", capital: "Porto Alegre",    judges: 55,  region: "Sul" },
  { uf: "SC", state: "Santa Catarina",   acronym: "TJSC",  capital: "Florianópolis",   judges: 35,  region: "Sul" },
]

const REGION_COLORS: Record<TJData["region"], string> = {
  "Norte":        "#34d399",
  "Nordeste":     "#fb923c",
  "Centro-Oeste": "#fbbf24",
  "Sudeste":      "#60a5fa",
  "Sul":          "#a78bfa",
}

// ─── TJ table ─────────────────────────────────────────────────────────────────

function TJTable() {
  const regions: TJData["region"][] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"]
  const byRegion = TJS.reduce<Record<string, TJData[]>>((acc, tj) => {
    if (!acc[tj.region]) acc[tj.region] = []
    acc[tj.region].push(tj)
    return acc
  }, {})

  return (
    <Card>
      <CardHeader>
        <CardTitle>Os 27 Tribunais de Justiça</CardTitle>
        <CardDescription className="mt-0.5">Por região · número de desembargadores aproximado</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              {["UF", "Tribunal", "Sede", "Desembargadores"].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {regions.map((region) => (
              <React.Fragment key={region}>
                <tr>
                  <td colSpan={4} className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: REGION_COLORS[region] }}>
                    {region}
                  </td>
                </tr>
                {byRegion[region]?.map((tj) => (
                  <tr key={tj.uf} className="hover:bg-bg-raised transition-colors">
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${REGION_COLORS[tj.region]}14`, color: REGION_COLORS[tj.region] }}>
                        {tj.uf}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-text-primary whitespace-nowrap">
                      {tj.acronym}
                      {tj.note && <span className="ml-1.5 text-[10px] font-normal text-text-muted">— {tj.note}</span>}
                    </td>
                    <td className="py-2 px-3 text-text-secondary">{tj.capital}</td>
                    <td className="py-2 px-3 text-text-secondary tabular-nums font-semibold">~{tj.judges}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border-default">
              <td colSpan={3} className="py-2 px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Total aproximado</td>
              <td className="py-2 px-3 text-xs font-bold text-text-primary tabular-nums">
                ~{TJS.reduce((s, t) => s + t.judges, 0).toLocaleString("pt-BR")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}

// ─── Competencies ─────────────────────────────────────────────────────────────

function Competencies() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>O que os TJs julgam</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Apelações contra decisões de juízes de 1ª instância estadual (cível e criminal)",
            "Mandados de segurança, habeas corpus e habeas data contra ato de juiz estadual",
            "Ações de divórcio, herança, contratos e responsabilidade civil entre particulares",
            "Crimes comuns (furto, roubo, homicídio) que não sejam de competência federal",
            "Processar e julgar governadores, deputados estaduais e prefeitos por crimes comuns",
            "Conflitos de competência entre juízes estaduais da mesma UF",
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
          <CardTitle>Limites da Justiça Estadual</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Não julga causas que envolvam a União, autarquias ou empresas públicas federais — competência federal",
            "Não julga crimes eleitorais — competência da Justiça Eleitoral",
            "Não julga conflitos trabalhistas — competência da Justiça do Trabalho",
            "Suas decisões podem ser revistas pelo STJ (questão de lei federal) ou STF (constitucional)",
            "Não pode declarar lei federal inconstitucional — só pode afastar a aplicação no caso concreto",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-danger mt-0.5 shrink-0">›</span>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

// ─── TJ vs TRF ────────────────────────────────────────────────────────────────

function TJvsTRF() {
  const rows = [
    { item: "Esfera",         tj: "Estadual",                        trf: "Federal" },
    { item: "Causas típicas", tj: "Particulares, crimes comuns",     trf: "União, autarquias, crimes federais" },
    { item: "Cobertura",      tj: "Um por estado (27 TJs)",          trf: "Por região (6 TRFs)" },
    { item: "Recurso ao STJ", tj: "Questão de lei federal (REsp)",   trf: "Questão de lei federal (REsp)" },
    { item: "Recurso ao STF", tj: "Questão constitucional (RE)",     trf: "Questão constitucional (RE)" },
    { item: "Custeio",        tj: "Orçamento estadual",              trf: "Orçamento federal (CJF)" },
    { item: "Nomeação",       tj: "1/5 OAB/MP + 4/5 magistratura",  trf: "1/5 OAB/MP + 4/5 magistratura" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tribunal de Justiça vs. TRF</CardTitle>
        <CardDescription className="mt-0.5">Quando um processo vai para o TJ e quando vai para o TRF</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider w-1/4">Aspecto</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9ffe57" }}>Tribunal de Justiça (TJ)</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#818cf8" }}>Tribunal Regional Federal (TRF)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((r) => (
              <tr key={r.item} className="hover:bg-bg-raised transition-colors">
                <td className="py-2 px-3 font-semibold text-text-muted">{r.item}</td>
                <td className="py-2 px-3 text-text-secondary">{r.tj}</td>
                <td className="py-2 px-3 text-text-secondary">{r.trf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Process flow ─────────────────────────────────────────────────────────────

function StateJudiciaryFlow() {
  const steps = [
    { number: "1ª", title: "Vara Estadual", description: "O processo começa no juízo de 1ª instância do estado — vara cível, criminal, família, fazenda pública etc.", color: "#9ffe57" },
    { number: "2ª", title: "Tribunal de Justiça (TJ)", description: "Recurso de apelação ou agravo sobe ao TJ. O colegiado de desembargadores estaduais revisa a decisão.", color: "#fbbf24" },
    { number: "3ª", title: "Superior Tribunal de Justiça (STJ)", description: "Se houver violação de lei federal infraconstitucional, cabe Recurso Especial (REsp) ao STJ.", color: "#a78bfa" },
    { number: "4ª", title: "Supremo Tribunal Federal (STF)", description: "Se houver questão constitucional, cabe Recurso Extraordinário (RE) ao STF — última instância.", color: "#c084fc" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caminho de um processo estadual</CardTitle>
        <CardDescription className="mt-0.5">Da 1ª instância até a cúpula do Judiciário</CardDescription>
      </CardHeader>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.number} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="shrink-0 flex items-center justify-center w-9 h-7 rounded-md text-[11px] font-bold" style={{ backgroundColor: `${step.color}18`, color: step.color, border: `1px solid ${step.color}40` }}>
                {step.number}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 my-1" style={{ backgroundColor: `${step.color}30` }} />}
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

// ─── TribunaisJusticaOverview ──────────────────────────────────────────────────

export function TribunaisJusticaOverview() {
  const totalJudges = TJS.reduce((s, t) => s + t.judges, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            Os Tribunais de Justiça (TJs) são a 2ª instância da Justiça estadual. Cada estado tem o seu, além
            do Distrito Federal — totalizando 27 tribunais. Julgam recursos contra decisões de juízes de 1ª
            instância em causas cíveis e criminais que não sejam de competência federal. O TJSP é o maior
            tribunal do mundo em volume processual, com mais de 30 milhões de processos em tramitação.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Tribunais</dt>
              <dd className="text-xs font-semibold text-text-primary">27 TJs (um por UF)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Desembargadores</dt>
              <dd className="text-xs font-semibold text-text-primary">~{totalJudges.toLocaleString("pt-BR")} no total</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Instância</dt>
              <dd className="text-xs font-semibold text-text-primary">2ª instância estadual</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Exceção</dt>
              <dd className="text-xs font-semibold text-text-primary">TJDFT custeado pela União</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* TJ table */}
      <TJTable />

      {/* Competencies */}
      <Competencies />

      {/* Process flow */}
      <StateJudiciaryFlow />

      {/* TJ vs TRF */}
      <TJvsTRF />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">
          Fonte: Constituição Federal art. 96–100 · CNJ · portais dos Tribunais de Justiça estaduais
        </p>
        <a
          href="https://www.cnj.jus.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          cnj.jus.br ↗
        </a>
      </div>
    </div>
  )
}
