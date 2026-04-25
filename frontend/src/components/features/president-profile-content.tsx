"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui"
import type { Politician } from "@/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface EconomicIndicator {
  label: string
  value: string
  note?: string
  trend?: "up" | "down" | "neutral"
  source: string
  sourceUrl: string
}

interface PresidentStaticData {
  eligibilityStatus: "pode_concorrer" | "inelegivel" | "nao_se_aplica"
  eligibilityNote: string
  eligibilitySourceUrl?: string
  indicators: EconomicIndicator[]
  highlights: { text: string; sourceUrl?: string }[]
  controversies: { text: string; sourceUrl?: string }[]
  contextNote?: string
}

// ─── Static data keyed by mandate start year (legislature) ───────────────────
// All data from official public sources — IBGE, BCB, TSE, Câmara, Senado.

const PRESIDENT_DATA: Record<number, PresidentStaticData> = {

  // ── Lula III (2023 – em curso) ──────────────────────────────────────────────
  2023: {
    eligibilityStatus: "pode_concorrer",
    eligibilityNote:
      "Elegível para reeleição em 2026. Iniciou o mandato em 1º/01/2023, contando como primeiro desta nova sequência — a Constituição permite uma reeleição imediata.",
    eligibilitySourceUrl: "https://www.tse.jus.br/eleicoes/eleicoes-2026",
    contextNote: "Mandato em curso · Dados até abril/2026",
    indicators: [
      {
        label: "PIB 2024",
        value: "+3,4%",
        note: "2º ano seguido acima de 3%",
        trend: "up",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/pib.php",
      },
      {
        label: "Desemprego (dez/2024)",
        value: "6,2%",
        note: "Menor desde o início da série PNAD (2012)",
        trend: "up",
        source: "PNAD · IBGE",
        sourceUrl: "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html",
      },
      {
        label: "IPCA 2024",
        value: "4,84%",
        note: "Acima do teto da meta (4,5%)",
        trend: "down",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
      {
        label: "Salário mínimo 2025",
        value: "R$ 1.518",
        note: "+5,7% de ganho real",
        trend: "up",
        source: "MTE",
        sourceUrl: "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/trabalhador/salario-minimo",
      },
    ],
    highlights: [
      { text: "Arcabouço fiscal aprovado (LC 200/2023) — substituiu o Teto de Gastos", sourceUrl: "https://www.camara.leg.br/noticias/987453-camara-aprova-arcabouco-fiscal" },
      { text: "Bolsa Família reestruturado: R$ 600/família + R$ 50 por criança de 0 a 6 anos", sourceUrl: "https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia" },
      { text: "Minha Casa Minha Vida relançado com meta de 3 milhões de unidades", sourceUrl: "https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida" },
      { text: "Reforma tributária aprovada (EC 132/2023) — maior desde 1988", sourceUrl: "https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm" },
      { text: "Brasil atingiu menor taxa de desemprego da história da PNAD Contínua", sourceUrl: "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html" },
    ],
    controversies: [
      { text: "Déficit primário de R$ 67 bilhões em 2024, acima do teto da meta fiscal", sourceUrl: "https://www.tesourotransparente.gov.br/publicacoes/resultado-do-tesouro-nacional-rtn/2024/12" },
      { text: "Dólar ultrapassou R$ 6 no fim de 2024 — máxima histórica", sourceUrl: "https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes" },
      { text: "Gastos previdenciários e vinculações orçamentárias comprimem espaço fiscal para investimentos", sourceUrl: "https://www.tesourotransparente.gov.br" },
    ],
  },

  // ── Bolsonaro (2019 – 2022) ─────────────────────────────────────────────────
  2019: {
    eligibilityStatus: "inelegivel",
    eligibilityNote:
      "Declarado inelegível pelo TSE em junho/2023 por abuso de poder político — usou reunião oficial com embaixadores para atacar o sistema eleitoral. Inelegível até 2030.",
    eligibilitySourceUrl: "https://www.tse.jus.br/comunicacao/noticias/2023/Junho/tse-torna-bolsonaro-inelegivel-por-oito-anos",
    indicators: [
      {
        label: "PIB (média 2019–2022)",
        value: "+1,7%/ano",
        note: "Pandemia: −3,3% em 2020",
        trend: "neutral",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/pib.php",
      },
      {
        label: "Desemprego (dez/2022)",
        value: "7,9%",
        note: "Pico de 14,9% em 2021",
        trend: "up",
        source: "PNAD · IBGE",
        sourceUrl: "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html",
      },
      {
        label: "IPCA 2021",
        value: "10,06%",
        note: "Maior inflação desde 2002",
        trend: "down",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
      {
        label: "Salário mínimo",
        value: "R$ 998 → R$ 1.212",
        note: "+21,4% nominal em 4 anos",
        trend: "neutral",
        source: "MTE",
        sourceUrl: "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/trabalhador/salario-minimo",
      },
    ],
    highlights: [
      { text: "Reforma da Previdência (EC 103/2019) — idade mínima de 65 (H) e 62 (M) anos", sourceUrl: "https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc103.htm" },
      { text: "Auxílio Emergencial de R$ 600 beneficiou 68 milhões de brasileiros durante a pandemia", sourceUrl: "https://www.gov.br/cidadania/pt-br/acoes-e-programas/auxilio-emergencial" },
      { text: "PIB cresceu 4,6% em 2022, maior alta desde 2010", sourceUrl: "https://www.ibge.gov.br/explica/pib.php" },
      { text: "Privatização da Eletrobras concluída em 2022", sourceUrl: "https://www.gov.br/mme/pt-br/assuntos/noticias/privatizacao-da-eletrobras" },
      { text: "Marco Legal do Saneamento (Lei 14.026/2020) — meta de universalização até 2033", sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l14026.htm" },
    ],
    controversies: [
      { text: "CPI da Covid (2021): relatório final concluiu omissão na compra de vacinas e crimes contra a humanidade", sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/149264" },
      { text: "IPCA atingiu 10,06% em 2021, corroendo a renda das famílias", sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php" },
      { text: "Declarado inelegível pelo TSE (2023) e condenado pelo STF por tentativa de golpe de Estado (2024)", sourceUrl: "https://www.stf.jus.br/portal/cms/verNoticiaDetalhe.asp?idConteudo=529984" },
    ],
  },

  // ── Temer (2016 – 2018) ─────────────────────────────────────────────────────
  2016: {
    eligibilityStatus: "nao_se_aplica",
    eligibilityNote:
      "Exerceu dois mandatos como vice e assumiu a presidência plena após o impeachment — a Constituição veda um terceiro mandato.",
    indicators: [
      {
        label: "PIB 2016–2018",
        value: "−3,3% / +1,3% / +1,3%",
        note: "Recessão herdada seguida de recuperação lenta",
        trend: "neutral",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/pib.php",
      },
      {
        label: "Desemprego (pico)",
        value: "13,7%",
        note: "Em 2017 — maior desde o início da PNAD",
        trend: "down",
        source: "PNAD · IBGE",
        sourceUrl: "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html",
      },
      {
        label: "IPCA 2017",
        value: "2,95%",
        note: "Menor inflação desde 1998",
        trend: "up",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
      {
        label: "Selic (fim 2018)",
        value: "6,5% a.a.",
        note: "Mínima histórica na época",
        trend: "up",
        source: "BCB",
        sourceUrl: "https://www.bcb.gov.br/controleinflacao/historicotaxasjuros",
      },
    ],
    highlights: [
      { text: "Teto de Gastos (EC 95/2016) — limitou crescimento real das despesas por 20 anos", sourceUrl: "https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc95.htm" },
      { text: "Reforma Trabalhista (Lei 13.467/2017) — maior alteração na CLT desde 1943", sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13467.htm" },
      { text: "Taxa Selic caiu de 14,25% para 6,5% ao ano", sourceUrl: "https://www.bcb.gov.br/controleinflacao/historicotaxasjuros" },
      { text: "Marco Legal da Terceirização (Lei 13.429/2017)", sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13429.htm" },
    ],
    controversies: [
      { text: "Assumiu a presidência sem eleição direta, após o impeachment de Dilma Rousseff", sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/125953" },
      { text: "Delatado na Operação Lava Jato — denunciado duas vezes pelo PGR, mas a Câmara barrou", sourceUrl: "https://www.stf.jus.br/portal/cms/verNoticiaDetalhe.asp?idConteudo=357237" },
      { text: "Reforma da Previdência não aprovada durante seu governo", sourceUrl: "https://www.camara.leg.br/noticias/510722-camara-adia-votacao-da-reforma-da-previdencia" },
    ],
  },

  // ── Dilma (2011 – 2016) ─────────────────────────────────────────────────────
  2011: {
    eligibilityStatus: "nao_se_aplica",
    eligibilityNote:
      "Sofreu impeachment em agosto de 2016. O Senado optou por não aplicar a pena de inabilitação, então não há vedação constitucional expressa — mas é cenário politicamente improvável.",
    eligibilitySourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/125953",
    indicators: [
      {
        label: "PIB (pico/vale)",
        value: "+3,9% (2011) / −3,5% (2015)",
        note: "Maior recessão desde os anos 1980",
        trend: "down",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/pib.php",
      },
      {
        label: "Desemprego (mínimo)",
        value: "5,9%",
        note: "Em 2014 — mínima histórica na época",
        trend: "neutral",
        source: "PNAD · IBGE",
        sourceUrl: "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html",
      },
      {
        label: "IPCA 2015",
        value: "10,67%",
        note: "Maior inflação desde 2002",
        trend: "down",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
      {
        label: "Dívida pública (2016)",
        value: "70% do PIB",
        note: "Alta de 10 p.p. em 5 anos",
        trend: "down",
        source: "Tesouro Nacional",
        sourceUrl: "https://www.tesourotransparente.gov.br/publicacoes/boletim-do-tesouro-nacional-btn/2016/12",
      },
    ],
    highlights: [
      { text: "Minha Casa Minha Vida fase II: 2 milhões de unidades habitacionais", sourceUrl: "https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida" },
      { text: "Marco Civil da Internet (Lei 12.965/2014)", sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm" },
      { text: "Brasil sediou a Copa do Mundo 2014 e as Olimpíadas Rio 2016", sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12350.htm" },
      { text: "Regime de partilha do pré-sal — Estado retém maior parte da renda petrolífera", sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12351.htm" },
    ],
    controversies: [
      { text: "Operação Lava Jato revelou esquema bilionário de corrupção na Petrobras, iniciado antes do seu governo", sourceUrl: "https://www.pf.gov.br/servicos-pf/servicos-ao-cidadao/notas-a-imprensa/arquivos/2014/nota-da-pf-operacao-lava-jato.pdf" },
      { text: "\"Pedaladas fiscais\" — atraso intencional de repasses a bancos públicos — motivaram o impeachment", sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/125953" },
      { text: "Recessão acumulada de −7% em 2015–2016 — maior desde os anos 1980", sourceUrl: "https://www.ibge.gov.br/explica/pib.php" },
    ],
  },

  // ── Lula I & II (2003 – 2010) ──────────────────────────────────────────────
  2003: {
    eligibilityStatus: "nao_se_aplica",
    eligibilityNote:
      "Exerceu dois mandatos (2003–2006 e 2007–2010). Em 2022 candidatou-se novamente após o intervalo de 4 anos fora do poder — permitido pela Constituição. Em 2026, disputará a reeleição pelo mandato atual (Lula III, iniciado em 2023).",
    indicators: [
      {
        label: "Crescimento médio",
        value: "+3,5%/ano",
        note: "Boom de commodities + expansão do mercado interno",
        trend: "up",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/pib.php",
      },
      {
        label: "Desemprego (2002→2010)",
        value: "11,7% → 6,7%",
        note: "Queda de 5 p.p. em 8 anos",
        trend: "up",
        source: "PME · IBGE",
        sourceUrl: "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9180-pesquisa-mensal-de-emprego.html",
      },
      {
        label: "IPCA (2003→2010)",
        value: "9,3% → 5,9%",
        note: "Convergência gradual para a meta",
        trend: "up",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
      {
        label: "Reservas internacionais",
        value: "US$ 37 bi → US$ 289 bi",
        note: "Brasil tornou-se credor do FMI em 2009",
        trend: "up",
        source: "BCB",
        sourceUrl: "https://www.bcb.gov.br/estabilidadefinanceira/reservasinternacionais",
      },
    ],
    highlights: [
      { text: "Bolsa Família criado (2003) — unificou programas sociais e reduziu pobreza extrema", sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10836.htm" },
      { text: "PIB cresceu 7,5% em 2010 — maior expansão desde 1986", sourceUrl: "https://www.ibge.gov.br/explica/pib.php" },
      { text: "PROUNI (2005) e expansão das universidades federais com o REUNI (2007)", sourceUrl: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11096.htm" },
      { text: "PAC — Programa de Aceleração do Crescimento (2007)", sourceUrl: "https://www.gov.br/secretariageral/pt-br/acesso-a-informacao/acoes-e-programas/pac" },
      { text: "Brasil tornou-se credor líquido externo pela 1ª vez na história", sourceUrl: "https://www.bcb.gov.br/estabilidadefinanceira/reservasinternacionais" },
    ],
    controversies: [
      { text: "Mensalão (2005): esquema de compra de votos no Congresso — vários dirigentes do PT condenados pelo STF", sourceUrl: "https://www.stf.jus.br/portal/cms/verNoticiaDetalhe.asp?idConteudo=219583" },
      { text: "Inflação herdada de 12,5% em 2002 exigiu Selic de 26,5% ao ano no início do mandato", sourceUrl: "https://www.bcb.gov.br/controleinflacao/historicotaxasjuros" },
    ],
  },

  // ── FHC (1995 – 2002) ───────────────────────────────────────────────────────
  1995: {
    eligibilityStatus: "nao_se_aplica",
    eligibilityNote:
      "Exerceu dois mandatos (1995–1998 e 1999–2002). A Constituição veda um terceiro mandato. Não integra o cenário eleitoral de 2026.",
    indicators: [
      {
        label: "Inflação 1994→2002",
        value: "916% → 12,5%",
        note: "Plano Real eliminou a hiperinflação",
        trend: "up",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
      {
        label: "PIB (média 1995–2002)",
        value: "+2,3%/ano",
        note: "Crises externas (Rússia 98, Argentina 01) limitaram crescimento",
        trend: "neutral",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/pib.php",
      },
      {
        label: "Desemprego (2002)",
        value: "11,7%",
        note: "Alta ao longo do 2º mandato",
        trend: "down",
        source: "PME · IBGE",
        sourceUrl: "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9180-pesquisa-mensal-de-emprego.html",
      },
      {
        label: "Dívida pública (2002)",
        value: "55% do PIB",
        note: "Alta de ~20 p.p. em 8 anos",
        trend: "down",
        source: "Tesouro Nacional",
        sourceUrl: "https://www.tesourotransparente.gov.br",
      },
    ],
    highlights: [
      { text: "Plano Real (jul/1994–1995) — acabou com a hiperinflação e criou a moeda vigente", sourceUrl: "https://www.bcb.gov.br/historicoplanoreal" },
      { text: "Lei de Responsabilidade Fiscal (LC 101/2000) — disciplina financeira dos entes públicos", sourceUrl: "https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp101.htm" },
      { text: "Privatizações: Telebrás, Vale, CSN, Banespa — R$ 70 bilhões arrecadados", sourceUrl: "https://www.bndes.gov.br/wps/portal/site/home/transparencia/pesquisa-de-satisfacao/PND" },
      { text: "Lei de Diretrizes e Bases da Educação Nacional (LDB · Lei 9.394/1996)", sourceUrl: "https://www.planalto.gov.br/ccivil_03/leis/l9394.htm" },
    ],
    controversies: [
      { text: "Crise cambial de 1999 forçou desvalorização do Real e adoção do câmbio flutuante", sourceUrl: "https://www.bcb.gov.br/historicoplanoreal" },
      { text: "Apagão de energia em 2001 — racionamento elétrico por 8 meses", sourceUrl: "https://www.camara.leg.br/noticias/15744-apagao-de-2001" },
      { text: "Emenda da reeleição aprovada em 1997 — denúncias de compra de votos não comprovadas judicialmente", sourceUrl: "https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc16.htm" },
    ],
  },

  // ── Itamar Franco (1992 – 1994) ─────────────────────────────────────────────
  1992: {
    eligibilityStatus: "nao_se_aplica",
    eligibilityNote: "Faleceu em 2 de julho de 2011. Não se aplica ao cenário eleitoral de 2026.",
    indicators: [
      {
        label: "Inflação 1993",
        value: "2.477%",
        note: "Pico da hiperinflação — antes do Plano Real (jul/1994)",
        trend: "neutral",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
      {
        label: "PIB 1993",
        value: "+4,9%",
        note: "Crescimento em contexto inflacionário",
        trend: "neutral",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/pib.php",
      },
      {
        label: "Lançamento do Real",
        value: "1 jul/1994",
        note: "Último mês de seu mandato — FHC como Ministro da Fazenda",
        trend: "up",
        source: "BCB",
        sourceUrl: "https://www.bcb.gov.br/historicoplanoreal",
      },
      {
        label: "Inflação 1994",
        value: "916%",
        note: "Acumulado do ano — mas caiu a zero após o Real",
        trend: "up",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
    ],
    highlights: [
      { text: "Assumiu após a renúncia de Collor (29/12/1992), restaurando a ordem constitucional", sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/27357" },
      { text: "Lançou o Plano Real com FHC como Ministro da Fazenda — a estabilização mais bem-sucedida do Brasil", sourceUrl: "https://www.bcb.gov.br/historicoplanoreal" },
      { text: "Governou em período de transição, recuperando a credibilidade institucional pós-Collor", sourceUrl: "https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc19.htm" },
    ],
    controversies: [
      { text: "Hiperinflação de 2.477% ao ano em 1993 — herdada dos anos anteriores", sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php" },
      { text: "Instabilidade política e econômica no período pós-impeachment de Collor", sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/27357" },
    ],
  },

  // ── Collor (1990 – 1992) ────────────────────────────────────────────────────
  1990: {
    eligibilityStatus: "nao_se_aplica",
    eligibilityNote:
      "Renunciou em 29/12/1992 diante do processo de impeachment. Foi declarado inelegível por 8 anos pelo Senado — pena já expirada. Não integra o cenário eleitoral de 2026.",
    eligibilitySourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/27357",
    indicators: [
      {
        label: "Inflação 1990",
        value: "1.621%",
        note: "Plano Collor congelou preços e confiscou poupanças",
        trend: "down",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/inflacao.php",
      },
      {
        label: "PIB 1990",
        value: "−4,3%",
        note: "Recessão causada pelo choque do Plano Collor",
        trend: "down",
        source: "IBGE",
        sourceUrl: "https://www.ibge.gov.br/explica/pib.php",
      },
      {
        label: "Confisco da poupança",
        value: "CR$ 1,5 trilhão",
        note: "Bloqueado por 18 meses — Plano Collor I (mar/1990)",
        trend: "down",
        source: "BCB",
        sourceUrl: "https://www.bcb.gov.br/historicoplanoreal",
      },
      {
        label: "Abertura comercial",
        value: "Tarifas: 60% → 35%",
        note: "Fim do protecionismo industrial",
        trend: "neutral",
        source: "MDIC",
        sourceUrl: "https://www.gov.br/mdic/pt-br",
      },
    ],
    highlights: [
      { text: "1º presidente eleito diretamente pelo voto popular após a ditadura (eleição de 1989)", sourceUrl: "https://www.tse.jus.br/eleicoes/eleicoes-anteriores/eleicoes-1989/resultado-da-eleicao-de-1989" },
      { text: "Abertura econômica — reduziu tarifas e expôs a indústria à concorrência externa", sourceUrl: "https://www.gov.br/mdic/pt-br" },
      { text: "Privatizações pioneiras: Usiminas, CSN, Acesita", sourceUrl: "https://www.bndes.gov.br/wps/portal/site/home/transparencia/pesquisa-de-satisfacao/PND" },
    ],
    controversies: [
      { text: "Plano Collor I (mar/1990): confiscou poupanças de toda a população por 18 meses", sourceUrl: "https://www.bcb.gov.br/historicoplanoreal" },
      { text: "Denúncias de corrupção pelo próprio irmão (Pedro Collor) levaram à CPI e ao impeachment", sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/27357" },
      { text: "Renunciou em 29/12/1992 para evitar a perda dos direitos políticos no Senado — que mesmo assim aplicou a pena", sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/27357" },
    ],
  },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const TREND_ICONS: Record<string, { icon: string; color: string }> = {
  up:      { icon: "↑", color: "#9ffe57" },
  down:    { icon: "↓", color: "#ff5794" },
  neutral: { icon: "→", color: "#ffd557" },
}

function SourceLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] hover:underline transition-colors"
      style={{ color: "#4a7a58" }}
      title={`Fonte: ${label}`}
    >
      ↗ {label}
    </a>
  )
}

function IndicatorCard({ ind }: { ind: EconomicIndicator }) {
  const trend = ind.trend ? TREND_ICONS[ind.trend] : null

  return (
    <div
      className="rounded-lg border p-3 space-y-1"
      style={{ borderColor: "#1e2e1e", backgroundColor: "#0a120a" }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{ind.label}</p>
      <p className="text-lg font-bold text-text-primary tabular-nums leading-tight">
        {trend && (
          <span className="mr-1 text-base" style={{ color: trend.color }}>
            {trend.icon}
          </span>
        )}
        {ind.value}
      </p>
      {ind.note && <p className="text-[11px] text-text-secondary leading-snug">{ind.note}</p>}
      <SourceLink label={ind.source} url={ind.sourceUrl} />
    </div>
  )
}

const ELIGIBILITY_CONFIG = {
  pode_concorrer: {
    color: "#9ffe57",
    bg: "#9ffe5712",
    border: "#9ffe5740",
    label: "Pode concorrer em 2026",
    icon: "✓",
  },
  inelegivel: {
    color: "#ff5794",
    bg: "#ff579412",
    border: "#ff579440",
    label: "Inelegível para 2026",
    icon: "✕",
  },
  nao_se_aplica: {
    color: "#6b7280",
    bg: "#6b728012",
    border: "#6b728040",
    label: "Não se aplica",
    icon: "—",
  },
}

function ElectionSection({ data, isCurrent }: { data: PresidentStaticData; isCurrent: boolean }) {
  const cfg = ELIGIBILITY_CONFIG[data.eligibilityStatus]

  const electionDate = new Date("2026-10-04")
  const today = new Date()
  const daysUntil = Math.ceil((electionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eleição Presidencial 2026</CardTitle>
      </CardHeader>
      <div className="space-y-4 px-1 pb-1">
        {/* Countdown */}
        {isCurrent && daysUntil > 0 && (
          <div
            className="flex items-center gap-4 rounded-lg p-3"
            style={{ backgroundColor: "#9ffe5708", border: "1px solid #9ffe5730" }}
          >
            <div className="text-center shrink-0">
              <p className="text-3xl font-black tabular-nums leading-none" style={{ color: "#9ffe57" }}>
                {daysUntil.toLocaleString("pt-BR")}
              </p>
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mt-0.5">
                dias até o 1º turno
              </p>
            </div>
            <div className="space-y-1 text-xs text-text-secondary">
              <p className="font-medium text-text-primary">1º turno · 4 de outubro de 2026</p>
              <p>2º turno · 25 de outubro de 2026 (se necessário)</p>
              <p className="text-text-muted">Sistema: maioria absoluta · dois turnos</p>
              <a
                href="https://www.tse.jus.br/eleicoes/eleicoes-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:underline transition-colors"
                style={{ color: "#4a7a58" }}
              >
                ↗ TSE · Eleições 2026
              </a>
            </div>
          </div>
        )}

        {/* Eligibility */}
        <div
          className="flex items-start gap-3 rounded-lg p-3"
          style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <span
            className="mt-0.5 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: cfg.border, color: cfg.color }}
          >
            {cfg.icon}
          </span>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="text-xs text-text-secondary leading-relaxed">{data.eligibilityNote}</p>
            {data.eligibilitySourceUrl && (
              <a
                href={data.eligibilitySourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[10px] hover:underline transition-colors"
                style={{ color: "#4a7a58" }}
              >
                ↗ Decisão do TSE
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function EconomicSection({ indicators }: { indicators: EconomicIndicator[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores Econômicos do Mandato</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-1 pb-1">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.label} ind={ind} />
        ))}
      </div>
    </Card>
  )
}

function HighlightsSection({
  highlights,
  controversies,
}: {
  highlights: { text: string; sourceUrl?: string }[]
  controversies: { text: string; sourceUrl?: string }[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Realizações do Mandato</CardTitle>
        </CardHeader>
        <ul className="space-y-3 px-1 pb-1">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-xs" style={{ color: "#9ffe57" }}>✓</span>
              <div className="space-y-0.5">
                <p className="text-xs text-text-secondary leading-snug">{h.text}</p>
                {h.sourceUrl && (
                  <a
                    href={h.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] hover:underline transition-colors"
                    style={{ color: "#4a7a58" }}
                  >
                    ↗ Fonte
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Críticas e Controvérsias</CardTitle>
        </CardHeader>
        <ul className="space-y-3 px-1 pb-1">
          {controversies.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-xs" style={{ color: "#ff5794" }}>!</span>
              <div className="space-y-0.5">
                <p className="text-xs text-text-secondary leading-snug">{c.text}</p>
                {c.sourceUrl && (
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] hover:underline transition-colors"
                    style={{ color: "#4a7a58" }}
                  >
                    ↗ Fonte
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface PresidentProfileContentProps {
  politician: Politician
}

export function PresidentProfileContent({ politician }: PresidentProfileContentProps) {
  const startYear = politician.legislature
  const isCurrent = politician.mandate_end === null
  const data = startYear ? PRESIDENT_DATA[startYear] : null

  return (
    <div className="space-y-6">
      {data?.contextNote && (
        <p className="text-xs text-text-muted italic">{data.contextNote}</p>
      )}

      {data && <ElectionSection data={data} isCurrent={isCurrent} />}

      {data && <EconomicSection indicators={data.indicators} />}

      {data && (
        <HighlightsSection
          highlights={data.highlights}
          controversies={data.controversies}
        />
      )}
    </div>
  )
}
