export const ROLE_OPTIONS = [
  { value: "deputado_federal", label: "Deputado Federal" },
  { value: "senador", label: "Senador" },
  { value: "presidente", label: "Presidente" },
  { value: "vice_presidente", label: "Vice-Presidente" },
  { value: "ministro", label: "Ministro de Estado" },
  { value: "ministro_stf", label: "Ministro do STF" },
  { value: "ministro_tribunal_superior", label: "Ministro de Tribunal Superior" },
  { value: "governador", label: "Governador" },
  { value: "prefeito", label: "Prefeito" },
  { value: "deputado_estadual", label: "Deputado Estadual" },
  { value: "vereador", label: "Vereador" },
]

export interface Category {
  slug: string
  role: string
  label: string
  description: string
  available: boolean
}

export const CATEGORIES: Category[] = [
  {
    slug: "congresso",
    role: "congresso",
    label: "Congresso Nacional",
    description: "Câmara dos Deputados + Senado Federal · 594 parlamentares",
    available: true,
  },
  {
    slug: "deputados",
    role: "deputado_federal",
    label: "Deputados Federais",
    description: "Câmara dos Deputados · 57ª Legislatura",
    available: true,
  },
  {
    slug: "senadores",
    role: "senador",
    label: "Senadores",
    description: "Senado Federal · 57ª Legislatura",
    available: true,
  },
  {
    slug: "presidentes",
    role: "presidente",
    label: "Presidentes",
    description: "Poder Executivo Federal · desde 1990",
    available: true,
  },
  {
    slug: "vice-presidentes",
    role: "vice_presidente",
    label: "Vice-Presidentes",
    description: "Poder Executivo Federal · desde 1990",
    available: true,
  },
  {
    slug: "ministerios",
    role: "ministro",
    label: "Ministérios",
    description: "Ministros de Estado · Governo Federal",
    available: true,
  },
  {
    slug: "judiciario",
    role: "judiciario",
    label: "Judiciário Federal",
    description: "STF · STJ · TSE · STM · TST e demais tribunais",
    available: true,
  },
  {
    slug: "stf",
    role: "ministro_stf",
    label: "Supremo Tribunal Federal",
    description: "Guarda da Constituição · 11 ministros",
    available: true,
  },
  {
    slug: "tribunais-superiores",
    role: "ministro_tribunal_superior",
    label: "Tribunais Superiores",
    description: "STJ · TSE · STM · TST",
    available: true,
  },
  {
    slug: "tribunais-federais",
    role: "desembargador_federal",
    label: "Tribunais Federais",
    description: "TRF1 ao TRF6 · 2ª instância da Justiça Federal",
    available: true,
  },
  {
    slug: "assembleias",
    role: "deputado_estadual",
    label: "Assembleias Legislativas",
    description: "26 Assembleias + CLDF · 1.059 deputados estaduais",
    available: true,
  },
  {
    slug: "governadores",
    role: "governador",
    label: "Governadores",
    description: "Poder Executivo Estadual · 27 estados + DF",
    available: true,
  },
  {
    slug: "secretarias-estaduais",
    role: "secretario_estadual",
    label: "Secretarias Estaduais",
    description: "Equivalentes estaduais dos ministérios federais",
    available: true,
  },
  {
    slug: "tribunais-justica",
    role: "desembargador_estadual",
    label: "Tribunais de Justiça",
    description: "TJs estaduais · 2ª instância da Justiça estadual",
    available: true,
  },
  {
    slug: "varas-primeira-instancia",
    role: "juiz",
    label: "Varas de 1ª Instância",
    description: "Varas estaduais e federais · onde os processos começam",
    available: true,
  },
  {
    slug: "camaras-municipais",
    role: "vereador",
    label: "Câmaras Municipais",
    description: "Poder Legislativo Municipal · ~59.000 vereadores",
    available: true,
  },
  {
    slug: "prefeitos",
    role: "prefeito",
    label: "Prefeitos",
    description: "Poder Executivo Municipal · 5.570 municípios",
    available: true,
  },
  {
    slug: "secretarias-municipais",
    role: "secretario_municipal",
    label: "Secretarias Municipais",
    description: "Equivalentes municipais dos ministérios · nomeados pelo Prefeito",
    available: true,
  },
  {
    slug: "dep-estaduais",
    role: "deputado_estadual",
    label: "Deputados Estaduais",
    description: "Assembleias Legislativas",
    available: false,
  },
  {
    slug: "vereadores",
    role: "vereador",
    label: "Vereadores",
    description: "Câmaras Municipais · ~59.000 eleitos em 2024",
    available: true,
  },
]

export const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

export const CHART_COLORS = {
  primary:   "#9ffe57",
  secondary: "#57fe9f",
  warning:   "#ffd557",
  danger:    "#fe5757",
  muted:     "#4a7a28",
}

export const CURRENT_YEAR = new Date().getFullYear()

export const YEAR_OPTIONS = Array.from(
  { length: 5 },
  (_, i) => CURRENT_YEAR - i
)
