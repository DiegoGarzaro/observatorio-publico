"use client"

import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── Vereador seats by population ─────────────────────────────────────────────

const SEATS_TABLE = [
  { population: "Até 15.000",          seats: "9",  example: "Municípios pequenos do interior" },
  { population: "15.001 – 30.000",     seats: "11", example: "" },
  { population: "30.001 – 50.000",     seats: "13", example: "" },
  { population: "50.001 – 80.000",     seats: "15", example: "" },
  { population: "80.001 – 120.000",    seats: "17", example: "" },
  { population: "120.001 – 160.000",   seats: "19", example: "" },
  { population: "160.001 – 300.000",   seats: "21", example: "" },
  { population: "300.001 – 450.000",   seats: "23", example: "" },
  { population: "450.001 – 600.000",   seats: "25", example: "" },
  { population: "600.001 – 750.000",   seats: "27", example: "" },
  { population: "750.001 – 900.000",   seats: "29", example: "" },
  { population: "900.001 – 1.050.000", seats: "31", example: "" },
  { population: "1.050.001 – 1.200.000","seats": "33", example: "" },
  { population: "1.200.001 – 1.350.000","seats": "35", example: "" },
  { population: "1.350.001 – 1.500.000","seats": "37", example: "" },
  { population: "Acima de 1.500.000",  seats: "até 55", example: "SP (55), RJ (51), BH (41)" },
]

// ─── Powers section ───────────────────────────────────────────────────────────

function Powers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>O que as Câmaras fazem</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Aprovar a Lei Orgânica do Município — a 'constituição' municipal",
            "Votar o orçamento municipal (LOA) e o Plano Diretor urbano",
            "Criar, alterar ou extinguir tributos municipais (ISS, IPTU, ITBI)",
            "Fiscalizar os atos do Prefeito e as contas da prefeitura (via TCE ou TCM)",
            "Autorizar o impeachment do Prefeito (2/3 dos vereadores)",
            "Legislar sobre assuntos de interesse local: zoneamento, transporte, obras",
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
          <CardTitle>Limites do poder municipal</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Não pode legislar sobre direito penal, civil, trabalhista ou comercial — competência federal",
            "Não pode criar impostos além dos previstos na CF (ISS, IPTU e ITBI)",
            "Leis municipais não podem contrariar leis estaduais ou federais",
            "O Prefeito pode vetar projetos de lei aprovados pela Câmara",
            "A Câmara pode derrubar o veto por maioria absoluta dos vereadores",
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

// ─── Seats table ──────────────────────────────────────────────────────────────

function SeatsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Número de vereadores por população</CardTitle>
        <CardDescription className="mt-0.5">
          Fixado pela CF art. 29, IV — proporcional ao tamanho do município
        </CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              {["Faixa populacional", "Vereadores", "Referência"].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {SEATS_TABLE.map((row) => (
              <tr key={row.population} className="hover:bg-bg-raised transition-colors">
                <td className="py-2 px-3 text-text-secondary">{row.population}</td>
                <td className="py-2 px-3 font-bold text-text-primary tabular-nums">{row.seats}</td>
                <td className="py-2 px-3 text-text-muted">{row.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Comparison ───────────────────────────────────────────────────────────────

function LegislativeComparison() {
  const rows = [
    { item: "Âmbito",         camara: "Municipal",                         assembleia: "Estadual",                      congresso: "Federal" },
    { item: "Membros",        camara: "9 a 55 vereadores",                 assembleia: "24 a 94 dep. estaduais",         congresso: "513 dep. + 81 sen." },
    { item: "Mandato",        camara: "4 anos · ilimitado",                assembleia: "4 anos · ilimitado",             congresso: "4/8 anos" },
    { item: "Eleição",        camara: "Proporcional",                      assembleia: "Proporcional",                   congresso: "Proporcional / majoritário" },
    { item: "Subsídio máx.",  camara: "20–75% do dep. estadual",           assembleia: "75% do dep. federal",            congresso: "R$ 46.366/mês" },
    { item: "Impeachment",    camara: "Autoriza o do Prefeito",            assembleia: "Autoriza o do Governador",       congresso: "Autoriza/julga o do Presidente" },
    { item: "Foro",           camara: "TJ (em regra)",                     assembleia: "TJ do estado",                   congresso: "STF" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>As três casas legislativas brasileiras</CardTitle>
        <CardDescription className="mt-0.5">Vereador · Deputado Estadual · Deputado Federal / Senador</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider">Aspecto</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#ffd557" }}>Câmara Municipal</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9ffe57" }}>Assembleia Legislativa</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#57c4ff" }}>Congresso Nacional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((r) => (
              <tr key={r.item} className="hover:bg-bg-raised transition-colors">
                <td className="py-2 px-3 font-semibold text-text-muted">{r.item}</td>
                <td className="py-2 px-3 text-text-secondary">{r.camara}</td>
                <td className="py-2 px-3 text-text-secondary">{r.assembleia}</td>
                <td className="py-2 px-3 text-text-secondary">{r.congresso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── How a law works locally ──────────────────────────────────────────────────

function LocalLawProcess() {
  const steps = [
    {
      number: "1",
      title: "Iniciativa",
      description: "Qualquer vereador, o Prefeito ou 5% dos eleitores do município podem apresentar um projeto de lei à Câmara.",
      color: "#ffd557",
    },
    {
      number: "2",
      title: "Comissões",
      description: "O projeto é analisado pelas comissões temáticas (obras, saúde, finanças etc.) que emitem pareceres técnicos e jurídicos.",
      color: "#fb923c",
    },
    {
      number: "3",
      title: "Votação em plenário",
      description: "O projeto é votado pelo plenário da Câmara. Aprovação por maioria simples para leis ordinárias; maioria absoluta para algumas matérias.",
      color: "#9ffe57",
    },
    {
      number: "4",
      title: "Sanção ou veto do Prefeito",
      description: "O Prefeito tem prazo para sancionar (transformar em lei) ou vetar total ou parcialmente. O veto pode ser derrubado pela Câmara por maioria absoluta.",
      color: "#60a5fa",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como uma lei municipal é aprovada</CardTitle>
        <CardDescription className="mt-0.5">Do projeto à promulgação</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            <div
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-0.5"
              style={{ backgroundColor: `${step.color}18`, color: step.color, border: `1px solid ${step.color}40` }}
            >
              {step.number}
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

// ─── CamarasMunicipaisOverview ────────────────────────────────────────────────

export function CamarasMunicipaisOverview() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            As Câmaras Municipais são o Poder Legislativo dos municípios brasileiros. Cada um dos 5.570
            municípios tem a sua. Os vereadores — eleitos pelo sistema proporcional a cada 4 anos — elaboram
            leis locais, aprovam o orçamento da prefeitura e fiscalizam o Executivo municipal. É o nível
            de poder mais próximo do cidadão: das calçadas ao Plano Diretor, tudo passa pela Câmara.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Câmaras</dt>
              <dd className="text-xs font-semibold text-text-primary">5.570 (um por município)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Vereadores</dt>
              <dd className="text-xs font-semibold text-text-primary">~59.000 em todo o Brasil</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Mandato</dt>
              <dd className="text-xs font-semibold text-text-primary">4 anos · reeleições ilimitadas</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Subsídio máximo</dt>
              <dd className="text-xs font-semibold text-text-primary">20–75% do dep. estadual</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Powers */}
      <Powers />

      {/* Law process */}
      <LocalLawProcess />

      {/* Seats table */}
      <SeatsTable />

      {/* Comparison */}
      <LegislativeComparison />

      {/* CTA */}
      <div className="flex justify-center py-2">
        <Link
          href="/vereadores"
          className="inline-flex items-center justify-center rounded-md h-9 px-4 text-sm font-semibold bg-accent text-bg-base hover:brightness-110 transition-all duration-150"
        >
          Ver lista de vereadores →
        </Link>
      </div>

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">
          Fonte: Constituição Federal art. 29–31 · IBGE · portais das Câmaras Municipais
        </p>
        <a
          href="https://www.interlegis.leg.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          interlegis.leg.br ↗
        </a>
      </div>
    </div>
  )
}
