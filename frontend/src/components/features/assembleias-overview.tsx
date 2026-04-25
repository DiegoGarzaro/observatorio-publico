"use client"

import React from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── Assembly data ────────────────────────────────────────────────────────────

interface Assembly {
  uf: string
  state: string
  acronym: string
  name: string
  deputies: number
  region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul"
  note?: string
}

const ASSEMBLIES: Assembly[] = [
  // Norte
  { uf: "AC", state: "Acre",            acronym: "ALEAC",  name: "Assembleia Legislativa do Acre",                     deputies: 24, region: "Norte" },
  { uf: "AM", state: "Amazonas",        acronym: "ALE-AM", name: "Assembleia Legislativa do Amazonas",                 deputies: 24, region: "Norte" },
  { uf: "AP", state: "Amapá",           acronym: "ALAP",   name: "Assembleia Legislativa do Amapá",                    deputies: 24, region: "Norte" },
  { uf: "PA", state: "Pará",            acronym: "ALEPA",  name: "Assembleia Legislativa do Pará",                     deputies: 41, region: "Norte" },
  { uf: "RO", state: "Rondônia",        acronym: "ALE-RO", name: "Assembleia Legislativa de Rondônia",                 deputies: 24, region: "Norte" },
  { uf: "RR", state: "Roraima",         acronym: "ALE-RR", name: "Assembleia Legislativa de Roraima",                  deputies: 24, region: "Norte" },
  { uf: "TO", state: "Tocantins",       acronym: "ALETO",  name: "Assembleia Legislativa do Tocantins",                deputies: 24, region: "Norte" },
  // Nordeste
  { uf: "AL", state: "Alagoas",         acronym: "ALE-AL", name: "Assembleia Legislativa de Alagoas",                  deputies: 27, region: "Nordeste" },
  { uf: "BA", state: "Bahia",           acronym: "ALBA",   name: "Assembleia Legislativa da Bahia",                    deputies: 63, region: "Nordeste" },
  { uf: "CE", state: "Ceará",           acronym: "ALECE",  name: "Assembleia Legislativa do Ceará",                    deputies: 46, region: "Nordeste" },
  { uf: "MA", state: "Maranhão",        acronym: "ALEMA",  name: "Assembleia Legislativa do Maranhão",                 deputies: 42, region: "Nordeste" },
  { uf: "PB", state: "Paraíba",         acronym: "ALPB",   name: "Assembleia Legislativa da Paraíba",                  deputies: 36, region: "Nordeste" },
  { uf: "PE", state: "Pernambuco",      acronym: "ALEPE",  name: "Assembleia Legislativa de Pernambuco",               deputies: 49, region: "Nordeste" },
  { uf: "PI", state: "Piauí",           acronym: "ALEPI",  name: "Assembleia Legislativa do Piauí",                    deputies: 30, region: "Nordeste" },
  { uf: "RN", state: "Rio Grande do Norte", acronym: "ALRN", name: "Assembleia Legislativa do Rio Grande do Norte",   deputies: 24, region: "Nordeste" },
  { uf: "SE", state: "Sergipe",         acronym: "ALESE",  name: "Assembleia Legislativa de Sergipe",                  deputies: 24, region: "Nordeste" },
  // Centro-Oeste
  { uf: "DF", state: "Distrito Federal", acronym: "CLDF",  name: "Câmara Legislativa do Distrito Federal",            deputies: 24, region: "Centro-Oeste", note: "Câmara Legislativa (não Assembleia)" },
  { uf: "GO", state: "Goiás",           acronym: "ALEGO",  name: "Assembleia Legislativa de Goiás",                    deputies: 41, region: "Centro-Oeste" },
  { uf: "MS", state: "Mato Grosso do Sul", acronym: "ALEMS", name: "Assembleia Legislativa de Mato Grosso do Sul",    deputies: 24, region: "Centro-Oeste" },
  { uf: "MT", state: "Mato Grosso",     acronym: "ALMT",   name: "Assembleia Legislativa de Mato Grosso",              deputies: 24, region: "Centro-Oeste" },
  // Sudeste
  { uf: "ES", state: "Espírito Santo",  acronym: "ALES",   name: "Assembleia Legislativa do Espírito Santo",           deputies: 30, region: "Sudeste" },
  { uf: "MG", state: "Minas Gerais",    acronym: "ALMG",   name: "Assembleia Legislativa de Minas Gerais",             deputies: 77, region: "Sudeste" },
  { uf: "RJ", state: "Rio de Janeiro",  acronym: "ALERJ",  name: "Assembleia Legislativa do Rio de Janeiro",           deputies: 70, region: "Sudeste" },
  { uf: "SP", state: "São Paulo",       acronym: "ALESP",  name: "Assembleia Legislativa de São Paulo",                deputies: 94, region: "Sudeste" },
  // Sul
  { uf: "PR", state: "Paraná",          acronym: "ALEP",   name: "Assembleia Legislativa do Paraná",                   deputies: 54, region: "Sul" },
  { uf: "RS", state: "Rio Grande do Sul", acronym: "ALRS", name: "Assembleia Legislativa do Rio Grande do Sul",        deputies: 55, region: "Sul" },
  { uf: "SC", state: "Santa Catarina",  acronym: "ALESC",  name: "Assembleia Legislativa de Santa Catarina",           deputies: 40, region: "Sul" },
]

const REGION_COLORS: Record<Assembly["region"], string> = {
  "Norte":        "#34d399",
  "Nordeste":     "#fb923c",
  "Centro-Oeste": "#fbbf24",
  "Sudeste":      "#60a5fa",
  "Sul":          "#a78bfa",
}

// ─── Assembly table ───────────────────────────────────────────────────────────

function AssemblyTable() {
  const byRegion = ASSEMBLIES.reduce<Record<string, Assembly[]>>((acc, a) => {
    if (!acc[a.region]) acc[a.region] = []
    acc[a.region].push(a)
    return acc
  }, {})

  const regions: Assembly["region"][] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>As 27 casas legislativas estaduais</CardTitle>
        <CardDescription className="mt-0.5">Por região · ordenadas alfabeticamente</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              {["UF", "Casa", "Nome completo", "Deputados"].map((h) => (
                <th
                  key={h}
                  className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {regions.map((region) => (
              <React.Fragment key={region}>
                <tr>
                  <td
                    colSpan={4}
                    className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: REGION_COLORS[region] }}
                  >
                    {region}
                  </td>
                </tr>
                {byRegion[region]?.map((a) => (
                  <tr key={a.uf} className="hover:bg-bg-raised transition-colors">
                    <td className="py-2 px-3">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${REGION_COLORS[a.region]}14`,
                          color: REGION_COLORS[a.region],
                        }}
                      >
                        {a.uf}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-text-primary whitespace-nowrap">{a.acronym}</td>
                    <td className="py-2 px-3 text-text-secondary">
                      {a.name}
                      {a.note && (
                        <span className="ml-1.5 text-[10px] text-text-muted">({a.note})</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-text-secondary tabular-nums font-semibold">{a.deputies}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border-default">
              <td colSpan={3} className="py-2 px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Total
              </td>
              <td className="py-2 px-3 text-xs font-bold text-text-primary tabular-nums">
                {ASSEMBLIES.reduce((s, a) => s + a.deputies, 0).toLocaleString("pt-BR")}
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
          <CardTitle>O que as Assembleias fazem</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Elaborar e votar as leis estaduais — tudo que a CF atribuir ao estado",
            "Aprovar o orçamento estadual (LOA) e o Plano Plurianual (PPA)",
            "Fiscalizar os atos do Poder Executivo estadual e do TCE",
            "Criar, fundir, desmembrar e extinguir municípios",
            "Autorizar o impeachment do Governador (2/3 dos deputados)",
            "Aprovar nomeações para tribunais (TJ, TCE) e cargos estratégicos",
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
          <CardTitle>Como os deputados estaduais são eleitos</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Sistema proporcional com lista aberta — igual aos deputados federais",
            "Mandato de 4 anos com reeleições ilimitadas",
            "Cada estado elege no mínimo 24 e no máximo 94 deputados estaduais",
            "Número de vagas: até 3× o número de deputados federais do estado (art. 27 CF)",
            "Subsídio limitado a 75% do salário de deputado federal (~R$ 34.774/mês)",
            "Imunidade parlamentar durante o mandato para atos praticados no exercício",
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

// ─── Federal vs State comparison ──────────────────────────────────────────────

function FederalVsState() {
  const rows = [
    { item: "Âmbito",         federal: "Nacional",                           state: "Estadual" },
    { item: "Membros",        federal: "513 deputados",                       state: "24 a 94 por estado" },
    { item: "Mandato",        federal: "4 anos · ilimitado",                  state: "4 anos · ilimitado" },
    { item: "Eleição",        federal: "Proporcional por estado",              state: "Proporcional por estado" },
    { item: "Subsídio bruto", federal: "R$ 46.366/mês",                       state: "Até R$ 34.774/mês (75%)" },
    { item: "Impeachment",    federal: "Autoriza o do Presidente",             state: "Autoriza o do Governador" },
    { item: "Orçamento",      federal: "Aprova LOA federal",                  state: "Aprova LOA estadual" },
    { item: "Foro",           federal: "STF",                                 state: "TJ do estado" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deputado estadual vs. deputado federal</CardTitle>
        <CardDescription className="mt-0.5">Semelhanças e diferenças entre os dois cargos</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider w-1/4">
                Aspecto
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#57c4ff" }}>
                Deputado Federal
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9ffe57" }}>
                Deputado Estadual
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((r) => (
              <tr key={r.item} className="hover:bg-bg-raised transition-colors">
                <td className="py-2 px-3 font-semibold text-text-muted">{r.item}</td>
                <td className="py-2 px-3 text-text-secondary">{r.federal}</td>
                <td className="py-2 px-3 text-text-secondary">{r.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── AssembleiasOverview ──────────────────────────────────────────────────────

export function AssembleiasOverview() {
  const total = ASSEMBLIES.reduce((s, a) => s + a.deputies, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            Cada estado brasileiro e o Distrito Federal têm sua própria casa legislativa. As Assembleias
            Legislativas (e a Câmara Legislativa do DF) são responsáveis por criar as leis estaduais, aprovar
            o orçamento do estado e fiscalizar o Poder Executivo estadual. Seus membros — os deputados estaduais
            — são eleitos pelo sistema proporcional a cada 4 anos.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Casas legislativas</dt>
              <dd className="text-xs font-semibold text-text-primary">27 (26 Assembleias + CLDF)</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Total de deputados</dt>
              <dd className="text-xs font-semibold text-text-primary">{total.toLocaleString("pt-BR")} estaduais</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Mandato</dt>
              <dd className="text-xs font-semibold text-text-primary">4 anos · reeleições ilimitadas</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Subsídio máximo</dt>
              <dd className="text-xs font-semibold text-text-primary">75% do dep. federal (~R$ 34.774)</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Assembly table */}
      <AssemblyTable />

      {/* Competencies */}
      <Competencies />

      {/* Federal vs State */}
      <FederalVsState />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">
          Fonte: Constituição Federal art. 27 · IBGE · portais das Assembleias Legislativas
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
