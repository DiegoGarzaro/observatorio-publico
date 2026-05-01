"use client"

import { useState } from "react"
import Link from "next/link"
import { ElectionCalendar } from "@/components/features/eleicoes/election-calendar"
import { ElectionPoliticiansList } from "@/components/features/eleicoes/election-politicians-list"
import { EmptyState } from "@/components/ui"

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#9ffe57"
const YELLOW = "#ffd557"
const BLUE = "#57c4ff"

type TabId = "presidente" | "senadores" | "deputados_federais" | "governadores" | "deputados_estaduais"

interface Tab {
  id: TabId
  label: string
  seats: string
}

const TABS: Tab[] = [
  { id: "deputados_federais", label: "Dep. Federais", seats: "513 vagas" },
  { id: "senadores", label: "Senadores", seats: "27 vagas" },
  { id: "governadores", label: "Governadores", seats: "27 vagas" },
  { id: "presidente", label: "Presidente", seats: "1 vaga" },
  { id: "deputados_estaduais", label: "Dep. Estaduais", seats: "~1.059 vagas" },
]

interface RaceInfo {
  title: string
  description: string
  seats: string
  term: string
  system: string
  note: string
  role: string | null
  incumbentLabel: string
}

const RACES: Record<TabId, RaceInfo> = {
  deputados_federais: {
    title: "Deputados Federais",
    description:
      "Representam o povo na Câmara dos Deputados. Propõem e votam leis federais, aprovam o orçamento da União e fiscalizam o Poder Executivo. Todos os 513 mandatos são renovados em 2026.",
    seats: "513 vagas — renovação total",
    term: "4 anos (2027–2030)",
    system:
      "Proporcional por lista aberta. O eleitor vota no candidato ou na legenda. As vagas de cada estado são distribuídas proporcionalmente à população (mín. 8, máx. 70 — SP).",
    note:
      "Cada estado e o DF elegem um número fixo de deputados. São Paulo tem 70 vagas; estados menores têm 8. O voto pode ser nominal (no candidato) ou de legenda (no partido).",
    role: "deputado_federal",
    incumbentLabel: "Mandato atual — pesquise o histórico de votações, gastos e proposições dos incumbentes",
  },
  senadores: {
    title: "Senadores Federais",
    description:
      "Representam os estados no Congresso Nacional. Aprovam tratados internacionais, julgam o presidente em crimes de responsabilidade e participam de todo o processo legislativo federal. Em 2026 são renovados 27 dos 81 senadores — os eleitos em 2018.",
    seats: "27 vagas (1/3 do Senado)",
    term: "8 anos (2027–2034)",
    system:
      "Majoritário simples. Cada estado elege 1 senador por ciclo. O candidato mais votado é eleito, sem necessidade de 2º turno.",
    note:
      "O Senado tem renovação alternada: 1/3 em um ciclo (27 vagas) e 2/3 no seguinte (54 vagas). Em 2026, cada estado elege 1 novo senador. O mandato é de 8 anos — o mais longo entre os cargos eletivos federais.",
    role: "senador",
    incumbentLabel: "Senadores atuais — os eleitos em 2018 têm mandato até 2026 e podem concorrer à reeleição",
  },
  governadores: {
    title: "Governadores Estaduais",
    description:
      "Chefes do Poder Executivo estadual. Gerenciam a administração do estado, executam políticas públicas, nomeiam secretários e sancionam ou vetam leis estaduais. Os eleitos em 2022 concluem o mandato em dezembro de 2026.",
    seats: "27 vagas (26 estados + DF)",
    term: "4 anos (2027–2030)",
    system:
      "Majoritário com possível 2º turno. Precisa de maioria absoluta (50%+1). Se nenhum candidato atingir esse patamar no 1º turno, os dois mais votados disputam o 2º turno.",
    note:
      "Reeleição é permitida por um único mandato consecutivo. Governadores que já foram reeleitos não podem candidatar-se novamente.",
    role: "governador",
    incumbentLabel: "Governadores atuais — verifique o perfil e o histórico do titular do seu estado",
  },
  presidente: {
    title: "Presidente da República",
    description:
      "Chefe de Estado e Chefe de Governo. Dirige a administração federal, nomeia ministros, comanda as Forças Armadas, representa o Brasil internacionalmente e sanciona ou veta projetos de lei aprovados pelo Congresso.",
    seats: "1 cargo",
    term: "4 anos (2027–2030)",
    system:
      "Majoritário com possível 2º turno. Precisa de maioria absoluta (50%+1) no 1º turno. Caso contrário, os dois candidatos mais votados disputam o 2º turno em 25 de outubro de 2026.",
    note:
      "O presidente atual (eleito em 2022) termina o mandato em 31 de dezembro de 2026. Reeleição é permitida por um mandato consecutivo. O vice-presidente é eleito na mesma chapa.",
    role: "presidente",
    incumbentLabel: "Presidente atual — explore o perfil e o histórico do cargo",
  },
  deputados_estaduais: {
    title: "Deputados Estaduais",
    description:
      "Compõem as Assembleias Legislativas estaduais (e a Câmara Legislativa do DF). Elaboram as leis estaduais, fiscalizam o governo do estado e aprovam o orçamento estadual. São eleitos pelo mesmo sistema proporcional dos deputados federais.",
    seats: "~1.059 vagas (26 assembleias + CLDF)",
    term: "4 anos (2027–2030)",
    system:
      "Proporcional por lista aberta — igual ao dos deputados federais, mas dentro de cada estado. O número de deputados varia: SP tem 94, estados menores têm 24.",
    note:
      "A Câmara Legislativa do Distrito Federal (CLDF) tem 24 distritais eleitos pelo mesmo sistema. Os deputados estaduais têm atribuições semelhantes às dos federais, mas na esfera estadual.",
    role: null,
    incumbentLabel: "",
  },
}

const VOTER_GUIDE = [
  {
    title: "Presença nas sessões",
    body: "Verifique a taxa de participação nas votações. Baixa presença pode indicar descaso com o mandato.",
  },
  {
    title: "Gastos com verba parlamentar",
    body: "Analise quanto foi gasto com CEAP e em quais categorias. Compare com a média dos colegas de bancada.",
  },
  {
    title: "Proposições apresentadas",
    body: "Confira quantos projetos de lei e requerimentos foram apresentados — e se se tornaram leis.",
  },
  {
    title: "Histórico de votações",
    body: "Veja como o candidato votou em temas que importam para você: reforma tributária, educação, meio ambiente.",
  },
  {
    title: "Consistência e partido",
    body: "Pesquise mudanças de partido ao longo da carreira. Instabilidade partidária pode indicar oportunismo.",
  },
  {
    title: "Ficha limpa",
    body: "Consulte o TSE para verificar condenações que possam tornar o candidato inelegível pela Lei da Ficha Limpa.",
  },
]

const OFFICIAL_LINKS = [
  { label: "TSE", href: "https://www.tse.jus.br" },
  { label: "Candidatos (DivulgaCand)", href: "https://divulgacandcontas.tse.jus.br" },
  { label: "Câmara dos Deputados", href: "https://www.camara.leg.br" },
  { label: "Senado Federal", href: "https://www.senado.leg.br" },
  { label: "Portal da Transparência", href: "https://www.portaltransparencia.gov.br" },
  { label: "API Câmara (dados abertos)", href: "https://dadosabertos.camara.leg.br/api/v2" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
      <p className="text-sm text-text-primary mt-0.5 leading-snug">{value}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Eleicoes2026Page() {
  const [activeTab, setActiveTab] = useState<TabId>("deputados_federais")
  const race = RACES[activeTab]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/"
          className="text-text-muted hover:text-text-primary transition-colors mt-1 shrink-0"
          aria-label="Voltar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ color: ACCENT, backgroundColor: `${ACCENT}15` }}
            >
              Eleições
            </span>
            <span className="text-text-muted text-xs">Brasil · 2026</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Eleições Gerais 2026</h1>
          <p className="text-sm text-text-secondary mt-1 max-w-xl">
            Conheça os cargos em disputa, o histórico dos incumbentes e as ferramentas para fazer uma escolha informada.
          </p>
        </div>
      </div>

      {/* Calendário eleitoral */}
      <ElectionCalendar />

      {/* Vagas em disputa — síntese */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-xl border p-3.5 space-y-0.5"
          style={{ borderColor: `${ACCENT}25`, backgroundColor: `${ACCENT}06` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
            Federal
          </p>
          <p className="text-base font-bold text-text-primary tabular-nums">541</p>
          <p className="text-[10px] text-text-secondary">Presidente + Senado + Câmara</p>
        </div>
        <div
          className="rounded-xl border p-3.5 space-y-0.5"
          style={{ borderColor: `${BLUE}25`, backgroundColor: `${BLUE}06` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BLUE }}>
            Estadual
          </p>
          <p className="text-base font-bold text-text-primary tabular-nums">~1.086</p>
          <p className="text-[10px] text-text-secondary">Governadores + Dep. estaduais</p>
        </div>
        <div
          className="rounded-xl border p-3.5 space-y-0.5"
          style={{ borderColor: "#1a2e1a", backgroundColor: "#0b140b" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Total
          </p>
          <p className="text-base font-bold text-text-primary tabular-nums">~1.627</p>
          <p className="text-[10px] text-text-secondary">Cargos em disputa</p>
        </div>
      </div>

      {/* Cargo tabs */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Cargos em disputa</p>
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="rounded-lg border px-3.5 py-2 text-xs font-medium transition-all"
                style={
                  isActive
                    ? {
                        borderColor: `${ACCENT}50`,
                        backgroundColor: `${ACCENT}12`,
                        color: ACCENT,
                      }
                    : {
                        borderColor: "#1a2e1a",
                        backgroundColor: "#0b140b",
                        color: "#6b8f6b",
                      }
                }
              >
                {tab.label}
                <span className="ml-1.5 opacity-60">{tab.seats}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Race info card */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ borderColor: "#1a2e1a", backgroundColor: "#0b140b" }}
      >
        <div>
          <h2 className="font-semibold text-text-primary">{race.title}</h2>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{race.description}</p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t"
          style={{ borderColor: "#162416" }}
        >
          <InfoRow label="Vagas" value={race.seats} />
          <InfoRow label="Mandato" value={race.term} />
          <InfoRow label="Sistema eleitoral" value={race.system} />
        </div>

        <div
          className="rounded-lg border px-4 py-3 text-xs text-text-secondary leading-relaxed"
          style={{ borderColor: `${YELLOW}20`, backgroundColor: `${YELLOW}06` }}
        >
          <span className="font-semibold" style={{ color: YELLOW }}>
            Saiba mais:{" "}
          </span>
          {race.note}
        </div>
      </div>

      {/* Incumbent politicians list or empty state */}
      {race.role ? (
        <div className="space-y-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {race.incumbentLabel}
          </p>
          <ElectionPoliticiansList key={race.role} role={race.role} />
        </div>
      ) : (
        <EmptyState
          title="Dados em desenvolvimento"
          description="Os dados de deputados estaduais ainda não estão disponíveis nesta plataforma. Consulte o TSE e as Assembleias Legislativas do seu estado para informações sobre os candidatos."
          icon={
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          }
        />
      )}

      {/* Voter guide */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ borderColor: "#1a2e1a", backgroundColor: "#0b140b" }}
      >
        <div>
          <h2 className="font-semibold text-text-primary">Como escolher bem</h2>
          <p className="text-sm text-text-secondary mt-1">
            Critérios objetivos para avaliar um candidato antes de votar
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {VOTER_GUIDE.map((tip) => (
            <div
              key={tip.title}
              className="rounded-lg border p-3.5 space-y-1"
              style={{ borderColor: "#162416", backgroundColor: "#090e09" }}
            >
              <p className="text-sm font-medium text-text-primary">{tip.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official resources */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Fontes oficiais</p>
        <div className="flex flex-wrap gap-2">
          {OFFICIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              style={{ borderColor: "#1a2e1a", backgroundColor: "#0b140b" }}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
