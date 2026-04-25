"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui"

// ─── Secretariat area data ────────────────────────────────────────────────────

interface SecretariatArea {
  area: string
  commonName: string
  responsibility: string
  note: string
  color: string
}

const SECRETARIAT_AREAS: SecretariatArea[] = [
  {
    area: "Saúde",
    commonName: "Secretaria Municipal de Saúde (SMS / SEMSA / SEMUS)",
    responsibility: "Atenção básica (UBS, ESF, UPA), vigilância sanitária e epidemiológica local, gestão dos agentes comunitários de saúde e regulação do SUS municipal.",
    note: "Maior ou 2ª maior secretaria na maioria dos municípios",
    color: "#34d399",
  },
  {
    area: "Educação",
    commonName: "Secretaria Municipal de Educação (SME / SEMED / SEMEC)",
    responsibility: "Rede municipal de creches e ensino fundamental — anos iniciais (1º ao 5º ano). O município não tem competência sobre ensino médio (estadual) nem ensino superior (federal).",
    note: "Responsável por educação infantil e fundamental I",
    color: "#60a5fa",
  },
  {
    area: "Obras e Infraestrutura",
    commonName: "Secretaria de Obras / Infraestrutura (SMOP / SEMOB / SEINFRA)",
    responsibility: "Construção e manutenção de vias, calçadas, praças, iluminação pública, drenagem pluvial e obras públicas municipais em geral.",
    note: "Alto volume de licitações e contratos",
    color: "#fb923c",
  },
  {
    area: "Fazenda / Finanças",
    commonName: "Secretaria de Fazenda (SMF / SEFAZ / SEF)",
    responsibility: "Arrecadação do ISS, IPTU e ITBI; execução orçamentária; gestão da dívida municipal; pagamento de fornecedores e da folha dos servidores.",
    note: "Responde pelo LRF e prestação de contas ao TCE/TCM",
    color: "#fbbf24",
  },
  {
    area: "Assistência Social",
    commonName: "Secretaria de Assistência Social (SMAS / SMAAS / SEAS)",
    responsibility: "Gestão dos CRAS e CREAS; programas de transferência de renda municipais; acolhimento de crianças, idosos e pessoas em situação de rua.",
    note: "Operacionaliza programas federais no território",
    color: "#a78bfa",
  },
  {
    area: "Administração / Gestão de Pessoas",
    commonName: "Secretaria de Administração (SAD / SEMAD / SEGE)",
    responsibility: "Concursos públicos, gestão da folha de servidores municipais, compras e licitações, patrimônio e tecnologia da informação da prefeitura.",
    note: "Gestão interna da máquina municipal",
    color: "#818cf8",
  },
  {
    area: "Urbanismo / Planejamento",
    commonName: "Secretaria de Urbanismo / Planejamento (SMUL / SEPLAN / SEURB)",
    responsibility: "Aplicação do Plano Diretor; licenciamento urbanístico de obras e parcelamento do solo; zoneamento e uso do solo; política habitacional municipal.",
    note: "Executa o Plano Diretor — obrigatório para municípios >20.000 hab.",
    color: "#f472b6",
  },
  {
    area: "Transporte / Mobilidade",
    commonName: "Secretaria de Transporte / Mobilidade (SMTR / SMT / SETRANSP)",
    responsibility: "Concessão e fiscalização do transporte coletivo municipal; gestão do trânsito; ciclofaixas; estacionamentos regulamentados e integração modal.",
    note: "Competência exclusiva do município sobre transporte local",
    color: "#38bdf8",
  },
  {
    area: "Meio Ambiente",
    commonName: "Secretaria de Meio Ambiente (SMMA / SEMAM / SEMEIA)",
    responsibility: "Licenciamento ambiental de pequenas obras, coleta seletiva e gestão de resíduos sólidos, arborização urbana, parques e áreas verdes municipais.",
    note: "Licenciamento municipal para empreendimentos de menor impacto",
    color: "#4ade80",
  },
  {
    area: "Desenvolvimento Econômico",
    commonName: "Secretaria de Desenvolvimento Econômico / Turismo (SMDE / SETUR)",
    responsibility: "Fomento ao comércio e empreendedorismo local; salas do empreendedor; atração de investimentos; turismo e eventos municipais.",
    note: "Tamanho varia muito conforme o perfil econômico do município",
    color: "#9ffe57",
  },
]

// ─── Area card ────────────────────────────────────────────────────────────────

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
        {area.note}
      </p>
    </div>
  )
}

// ─── Hierarchy ────────────────────────────────────────────────────────────────

function MunicipalStructure() {
  const steps = [
    {
      title: "Prefeito",
      description: "Nomeia e exonera secretários livremente. Define as prioridades de governo e o tamanho do secretariado municipal.",
      color: "#9ffe57",
    },
    {
      title: "Secretários Municipais",
      description: "Dirigem as secretarias, editam portarias e decretos regulamentares, gerenciam orçamento setorial e respondem pelos resultados perante o Prefeito e a Câmara.",
      color: "#fbbf24",
    },
    {
      title: "Diretores e Coordenadores",
      description: "Segundo escalão — coordenam divisões dentro da secretaria (ex: Diretoria de Atenção Básica dentro da Secretaria de Saúde).",
      color: "#fb923c",
    },
    {
      title: "Servidores de carreira",
      description: "Servidores efetivos concursados que executam as políticas públicas independentemente de quem seja o secretário. Garantem continuidade administrativa.",
      color: "#60a5fa",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hierarquia interna do Executivo municipal</CardTitle>
        <CardDescription className="mt-0.5">Do Prefeito ao servidor de carreira</CardDescription>
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

// ─── Comparison table ─────────────────────────────────────────────────────────

function SecretaryComparison() {
  const rows = [
    { item: "Âmbito",            municipal: "Municipal",                              estadual: "Estadual",                              federal: "Federal" },
    { item: "Nomeação",          municipal: "Livre escolha do Prefeito",              estadual: "Livre escolha do Governador",            federal: "Livre escolha do Presidente" },
    { item: "Mandato",           municipal: "Enquanto durar a confiança",             estadual: "Enquanto durar a confiança",             federal: "Enquanto durar a confiança" },
    { item: "Subsídio máx.",     municipal: "20–75% do secretário estadual",          estadual: "75% do ministro federal (~R$ 34k)",      federal: "R$ 46.366/mês" },
    { item: "Fiscalização",      municipal: "Câmara Municipal",                       estadual: "Assembleia Legislativa",                 federal: "Congresso Nacional" },
    { item: "Contas",            municipal: "TCE ou TCM do estado",                   estadual: "TCE do estado",                         federal: "TCU" },
    { item: "Foro",              municipal: "TJ do estado (em regra)",                estadual: "TJ do estado (em regra)",                federal: "STF" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secretário municipal vs. estadual vs. ministro federal</CardTitle>
        <CardDescription className="mt-0.5">As três esferas do Executivo no Brasil</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider w-1/5">Aspecto</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#ffd557" }}>
                Secretário Municipal
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9ffe57" }}>
                Secretário Estadual
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: "#57c4ff" }}>
                Ministro Federal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((r) => (
              <tr key={r.item} className="hover:bg-bg-raised transition-colors">
                <td className="py-2 px-3 font-semibold text-text-muted">{r.item}</td>
                <td className="py-2 px-3 text-text-secondary">{r.municipal}</td>
                <td className="py-2 px-3 text-text-secondary">{r.estadual}</td>
                <td className="py-2 px-3 text-text-secondary">{r.federal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Powers section ───────────────────────────────────────────────────────────

function Powers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>O que as secretarias fazem</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Executar as políticas públicas municipais definidas pelo Prefeito e aprovadas pela Câmara",
            "Gerir o orçamento da pasta — elaborar e executar o plano de trabalho setorial",
            "Contratar e gerir servidores, prestadores de serviço e equipamentos da área",
            "Publicar portarias e regulamentos que orientam os serviços municipais",
            "Prestar contas ao Prefeito, à Câmara e ao Tribunal de Contas competente",
            "Representar o município em convênios com estado e União na área da secretaria",
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
          <CardTitle>Limites das secretarias municipais</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            "Não podem legislar — só o Prefeito (via projeto) e a Câmara aprovam leis municipais",
            "Secretarias de Educação municipal não têm competência sobre ensino médio ou superior",
            "Secretarias de Saúde dependem de repasses estaduais e federais para alta complexidade",
            "Secretarias de obras ficam limitadas ao Plano Diretor e ao zoneamento aprovados",
            "Não podem criar cargos nem contratar sem autorização da Câmara e do orçamento aprovado",
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

// ─── SecretariasMunicipaisOverview ────────────────────────────────────────────

export function SecretariasMunicipaisOverview() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="space-y-4 p-1">
          <p className="text-sm text-text-secondary leading-relaxed">
            As Secretarias Municipais são o equivalente municipal dos ministérios federais e das secretarias
            estaduais. Cada prefeitura organiza o seu secretariado conforme a realidade local: municípios
            pequenos podem ter 5–8 secretarias; grandes como São Paulo e Rio de Janeiro chegam a mais de 20.
            Os secretários são nomeados livremente pelo Prefeito e respondem a ele diretamente. Não há mandato
            fixo — podem ser exonerados a qualquer momento.
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Nomeação</dt>
              <dd className="text-xs font-semibold text-text-primary">Livre escolha do Prefeito</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Mandato</dt>
              <dd className="text-xs font-semibold text-text-primary">Enquanto durar a confiança</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Fiscalização</dt>
              <dd className="text-xs font-semibold text-text-primary">Câmara Municipal + TCE/TCM</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Municípios</dt>
              <dd className="text-xs font-semibold text-text-primary">5.570 prefeituras no Brasil</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Powers */}
      <Powers />

      {/* Area cards */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
          Principais secretarias — presentes na maioria dos municípios
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECRETARIAT_AREAS.map((area) => (
            <AreaCard key={area.area} area={area} />
          ))}
        </div>
      </div>

      {/* Hierarchy */}
      <MunicipalStructure />

      {/* Comparison */}
      <SecretaryComparison />

      {/* Source note */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-default">
        <p className="text-[10px] text-text-muted">
          Fonte: Constituição Federal art. 29–31 · Lei de Responsabilidade Fiscal · IBGE · portais das prefeituras
        </p>
        <a
          href="https://www.ibge.gov.br/municipios"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          ibge.gov.br ↗
        </a>
      </div>
    </div>
  )
}
