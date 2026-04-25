"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle, EmptyState, Pagination, Skeleton, StatCard } from "@/components/ui"
import { useAmendmentSummary, useAmendments } from "@/lib/hooks"
import type { Amendment, AmendmentSummary } from "@/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCE_URL = "https://portaldatransparencia.gov.br/emendas"
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

// Types whose presence is itself a risk signal
const UNCONSTITUTIONAL_TYPES = new Set(["Emenda de Relator", "Emenda RP 9"])
const PIX_TYPES = new Set(["Emenda Pix", "Emenda de Relator", "Emenda RP 9"])

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1).replace(".", ",")} bi`
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} mi`
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)
}

// ─── Risk engine ──────────────────────────────────────────────────────────────

type Severity = "critical" | "warning" | "info"

interface RiskFlag {
  severity: Severity
  title: string
  detail: string
  learnMoreUrl?: string
}

function computeSummaryRisks(s: AmendmentSummary): RiskFlag[] {
  const flags: RiskFlag[] = []
  const pixPct = s.total_committed > 0 ? (s.pix_committed / s.total_committed) * 100 : 0
  const paidPct = s.total_committed > 0 ? (s.total_paid / s.total_committed) * 100 : 0
  const hasUnconstitutional = s.by_type.some(
    (t) => t.amendment_type && UNCONSTITUTIONAL_TYPES.has(t.amendment_type)
  )

  if (hasUnconstitutional) {
    flags.push({
      severity: "critical",
      title: "Tipo declarado inconstitucional pelo STF",
      detail:
        'Há emendas do tipo "Emenda de Relator" ou "Emenda RP 9" — ambas foram declaradas inconstitucionais pelo STF em 2022 por permitir distribuição de verba pública sem critério, identificação ou publicidade. Ficaram conhecidas como "orçamento secreto".',
      learnMoreUrl: "https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=496699",
    })
  }

  if (pixPct >= 50) {
    flags.push({
      severity: "critical",
      title: `${pixPct.toFixed(0)}% das verbas sem rastreabilidade (Emenda Pix)`,
      detail:
        "A maior parte dos recursos foi destinada via Emenda Pix — um mecanismo onde o dinheiro vai para estados e municípios sem identificar o projeto ou o beneficiário final. Isso torna praticamente impossível verificar se o dinheiro foi bem gasto.",
      learnMoreUrl: SOURCE_URL,
    })
  } else if (pixPct >= 20) {
    flags.push({
      severity: "warning",
      title: `${pixPct.toFixed(0)}% das verbas via Emenda Pix (sem rastreabilidade)`,
      detail:
        "Uma parcela relevante dos recursos foi destinada sem identificação do beneficiário final. A Emenda Pix dificulta o controle social e a fiscalização.",
      learnMoreUrl: SOURCE_URL,
    })
  }

  if (s.total_committed > 0 && paidPct < 20) {
    flags.push({
      severity: "critical",
      title: `Apenas ${paidPct.toFixed(0)}% do valor reservado foi pago`,
      detail:
        "O governo comprometeu essa verba, mas quase nada foi transferido. Isso pode indicar obras não executadas, projetos inexistentes ou superfaturamento descoberto após o empenho.",
      learnMoreUrl: SOURCE_URL,
    })
  } else if (s.total_committed > 0 && paidPct < 50) {
    flags.push({
      severity: "warning",
      title: `Apenas ${paidPct.toFixed(0)}% do valor reservado foi efetivamente pago`,
      detail:
        "Menos da metade do valor empenhado chegou ao destino. Isso merece atenção: pode refletir obras paralisadas, licitações fracassadas ou projetos que nunca saíram do papel.",
    })
  }

  return flags
}

interface AmendmentRisk {
  severity: Severity
  label: string
  tooltip: string
}

function computeAmendmentRisks(a: Amendment): AmendmentRisk[] {
  const risks: AmendmentRisk[] = []

  if (a.amendment_type && UNCONSTITUTIONAL_TYPES.has(a.amendment_type)) {
    risks.push({
      severity: "critical",
      label: "Tipo inconstitucional",
      tooltip:
        "Este tipo de emenda foi declarado inconstitucional pelo STF em 2022 — o chamado 'orçamento secreto'. A distribuição de recursos sem publicidade ou critério facilita o desvio de verba pública.",
    })
  }

  if (a.is_pix && !UNCONSTITUTIONAL_TYPES.has(a.amendment_type ?? "")) {
    risks.push({
      severity: "warning",
      label: "Sem rastreabilidade",
      tooltip:
        "Emenda Pix: o dinheiro é transferido sem identificar o projeto ou o beneficiário final. Não é possível verificar o que foi comprado ou construído com esse valor.",
    })
  }

  if (a.committed_value > 100_000 && a.paid_value === 0) {
    risks.push({
      severity: "warning",
      label: "Sem execução",
      tooltip:
        "O governo reservou essa verba mas nenhum centavo foi pago ainda. Pode ser que o projeto ainda esteja em andamento — mas pode também indicar obra que nunca existiu.",
    })
  } else if (a.committed_value > 0 && a.paid_value > 0 && a.paid_value / a.committed_value < 0.15) {
    risks.push({
      severity: "warning",
      label: "Execução mínima",
      tooltip:
        "Menos de 15% do valor reservado foi pago. O restante está comprometido mas sem repasse — o que exige acompanhamento para verificar se há irregularidade.",
    })
  }

  return risks
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<Severity, { border: string; bg: string; icon: string; badge: string; text: string }> = {
  critical: {
    border: "border-danger/40",
    bg: "bg-danger/5",
    icon: "text-danger",
    badge: "bg-danger/10 text-danger border-danger/30",
    text: "text-danger",
  },
  warning: {
    border: "border-[#f59e0b]/40",
    bg: "bg-[#f59e0b]/5",
    icon: "text-[#f59e0b]",
    badge: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
    text: "text-[#f59e0b]",
  },
  info: {
    border: "border-accent/30",
    bg: "bg-accent/5",
    icon: "text-accent",
    badge: "bg-accent/10 text-accent border-accent/30",
    text: "text-accent",
  },
}

function SeverityIcon({ severity, size = 16 }: { severity: Severity; size?: number }) {
  if (severity === "critical") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

// ─── Risk Dashboard ───────────────────────────────────────────────────────────

function RiskDashboard({ summary, year }: { summary: AmendmentSummary; year?: number }) {
  const flags = computeSummaryRisks(summary)
  if (flags.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent shrink-0">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-accent">Nenhum indicador de risco detectado</p>
          <p className="text-sm text-text-muted">
            Os padrões de execução e transparência estão dentro do esperado para o período analisado.
          </p>
        </div>
      </div>
    )
  }

  const criticals = flags.filter((f) => f.severity === "critical").length
  const warnings = flags.filter((f) => f.severity === "warning").length

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-xs font-bold text-text-primary">Indicadores de risco</span>
        </div>
        <div className="flex gap-1.5">
          {criticals > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/30">
              {criticals} crítico{criticals !== 1 ? "s" : ""}
            </span>
          )}
          {warnings > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30">
              {warnings} atenção
            </span>
          )}
        </div>
        <p className="text-[10px] text-text-muted ml-auto">Análise automática com base nos dados oficiais</p>
      </div>

      {/* Flags */}
      {flags.map((flag, i) => {
        const st = SEVERITY_STYLES[flag.severity]
        return (
          <div key={i} className={`rounded-xl border ${st.border} ${st.bg} p-4 space-y-1.5`}>
            <div className={`flex items-start gap-2.5 ${st.text}`}>
              <SeverityIcon severity={flag.severity} />
              <p className="text-sm font-semibold leading-snug">{flag.title}</p>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed pl-[22px]">{flag.detail}</p>
            {flag.learnMoreUrl && (
              <div className="pl-[22px]">
                <a
                  href={flag.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs font-medium ${st.text} hover:underline`}
                >
                  Saiba mais / verificar fonte
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        )
      })}

      <p className="text-sm text-text-muted px-1">
        ⚠ Estes indicadores são baseados em padrões estatísticos e registros oficiais.
        Apontam situações que merecem investigação — não constituem comprovação de ilegalidade.
        <a
          href={year ? `${SOURCE_URL}?ano=${year}` : SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 underline hover:text-accent"
        >
          Verifique os dados originais no Portal da Transparência.
        </a>
      </p>
    </div>
  )
}

// ─── Amendment risk badges ────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: AmendmentRisk }) {
  const [open, setOpen] = useState(false)
  const st = SEVERITY_STYLES[risk.severity]
  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${st.badge} flex items-center gap-1`}>
        <SeverityIcon severity={risk.severity} size={10} />
        {risk.label}
      </span>
      {open && (
        <span className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-bg-overlay border border-border-default px-3 py-2 text-xs text-text-secondary shadow-xl z-50">
          {risk.tooltip}
        </span>
      )}
    </span>
  )
}

// ─── Type tooltip badge ───────────────────────────────────────────────────────

const TYPE_DESCRIPTIONS: Record<string, string> = {
  "Emenda Individual": "Cada deputado e senador tem direito a indicar onde gastar uma verba anual do orçamento federal. É a emenda mais comum e com maior rastreabilidade.",
  "Emenda de Bancada": "Todos os parlamentares de um estado se reúnem e indicam juntos onde investir uma verba coletiva.",
  "Emenda de Comissão": "Uma comissão parlamentar (grupo temático) indica investimentos na sua área de atuação.",
  "Emenda Pix": "O dinheiro vai direto para o governo estadual ou municipal sem identificar o beneficiário final nem o projeto. É o tipo mais opaco.",
  "Emenda de Relator": "Declarado inconstitucional pelo STF em 2022. Conhecido como 'orçamento secreto'.",
  "Emenda RP 9": "Funcionou de forma similar à Emenda de Relator — contestada por falta de transparência e inconstitucionalidade.",
}

function TypeBadge({ type, isPix }: { type: string; isPix: boolean }) {
  const [open, setOpen] = useState(false)
  const description = TYPE_DESCRIPTIONS[type] ?? "Tipo de emenda sem descrição catalogada. Consulte o Portal da Transparência para mais detalhes."
  const isRisky = isPix || UNCONSTITUTIONAL_TYPES.has(type)
  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={[
        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
        isRisky
          ? UNCONSTITUTIONAL_TYPES.has(type)
            ? "text-danger bg-danger/10 border-danger/30"
            : "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30"
          : "text-text-muted bg-bg-raised border-border-default",
      ].join(" ")}>
        {type}
      </span>
      {open && (
        <span className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-bg-overlay border border-border-default px-3 py-2.5 text-xs text-text-secondary shadow-xl z-50">
          {description}
        </span>
      )}
    </span>
  )
}

// ─── Payment gap card ─────────────────────────────────────────────────────────

function PaymentGapCard({ committed, paid }: { committed: number; paid: number }) {
  if (committed === 0) return null

  const isOverpaid = paid > committed
  const excess = paid - committed
  const paidPct = Math.round((paid / committed) * 100)
  const notPaid = committed - paid

  // Normal execution colours
  const isGood = !isOverpaid && paidPct >= 70
  const isCritical = !isOverpaid && paidPct < 20
  const barColor = isCritical ? "bg-danger" : paidPct < 50 ? "bg-[#f59e0b]" : "bg-accent"
  const labelColor = isOverpaid ? "text-danger" : isCritical ? "text-danger" : paidPct < 50 ? "text-[#f59e0b]" : "text-accent"
  const label = isOverpaid ? "Valor pago excede o reservado" : isCritical ? "Execução crítica" : paidPct < 50 ? "Execução parcial" : isGood ? "Boa execução" : "Execução regular"

  return (
    <Card>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Quanto do dinheiro reservado chegou ao destino?
            </p>
            <p className="text-sm text-text-muted mt-0.5">
              <strong className="text-text-secondary">Reservado</strong> = governo separou a verba no orçamento ·{" "}
              <strong className="text-text-secondary">Pago</strong> = dinheiro transferido ao beneficiário (prefeitura, hospital etc.)
            </p>
          </div>
          <span className={`text-lg font-bold tabular-nums shrink-0 ${labelColor}`}>{paidPct}%</span>
        </div>

        <div className="space-y-1.5">
          {isOverpaid ? (
            /* Overpaid bar: full normal portion + red excess segment */
            <div className="h-3 rounded-full bg-bg-raised overflow-hidden flex">
              <div className="h-full bg-accent flex-shrink-0" style={{ width: `${(committed / paid) * 100}%` }} />
              <div className="h-full bg-danger flex-grow transition-all duration-700" />
            </div>
          ) : (
            <div className="h-3 rounded-full bg-bg-raised overflow-hidden">
              <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${paidPct}%` }} />
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Pago: <strong className="text-text-secondary">{formatBRL(paid)}</strong></span>
            <span>Reservado: <strong className="text-text-secondary">{formatBRL(committed)}</strong></span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 text-sm font-medium ${labelColor}`}>
          <span>●</span>
          <span>{label}</span>
          {!isOverpaid && notPaid > 0 && (
            <span className="text-text-muted font-normal">
              · {formatBRL(notPaid)} reservados mas ainda não transferidos
            </span>
          )}
        </div>

        {isOverpaid && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 space-y-1">
            <p className="text-sm font-semibold text-danger">
              {formatBRL(excess)} pagos além do que foi reservado
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              O valor pago superou o valor empenhado. Isso pode acontecer quando empenhos de anos anteriores
              (restos a pagar) são quitados no período atual — o que é legal e relativamente comum.
              Porém, também pode indicar <strong className="text-text-secondary">pagamentos sem cobertura orçamentária</strong>,
              o que configura irregularidade grave. Vale verificar os registros individuais no Portal da Transparência.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Source footer ────────────────────────────────────────────────────────────

function SourceFooter({ year }: { year?: number }) {
  return (
    <div className="flex items-center justify-between gap-2 pt-3 border-t border-border-default">
      <p className="text-[10px] text-text-muted">Fonte: Portal da Transparência · Governo Federal</p>
      <a
        href={year ? `${SOURCE_URL}?ano=${year}` : SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] text-accent hover:underline flex items-center gap-1 shrink-0"
      >
        Verificar dados originais
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  )
}

// ─── Explainer ────────────────────────────────────────────────────────────────

function ExplainerCard({ politicianId, yearFrom, yearTo }: { politicianId?: number; yearFrom?: number; yearTo?: number }) {
  const isPresidentView = !politicianId && (yearFrom !== undefined || yearTo !== undefined)
  const mandateLabel = yearFrom
    ? yearTo
      ? `${yearFrom}–${yearTo}`
      : `${yearFrom} em diante`
    : null

  return (
    <div className="rounded-xl border border-border-default bg-bg-raised p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span className="text-xs font-semibold text-text-primary">O que são emendas parlamentares?</span>
        </div>
        <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline shrink-0 flex items-center gap-1">
          Portal da Transparência
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* Lead */}
      <p className="text-sm text-text-secondary leading-relaxed">
        {politicianId
          ? "Todo ano, cada deputado e senador tem direito a indicar onde o governo federal deve gastar uma parte do dinheiro público — obras, hospitais, escolas, equipamentos. O parlamentar não recebe esse dinheiro no bolso: ele só aponta o destino. Quem paga é o governo federal, diretamente para a prefeitura, hospital ou entidade escolhida."
          : isPresidentView
            ? `O presidente não faz emendas — isso é exclusivo de deputados e senadores. O que aparece aqui é o total de todas as emendas feitas pelos parlamentares${mandateLabel ? ` durante este mandato (${mandateLabel})` : ""}. Em outras palavras: quanto dinheiro público os deputados e senadores indicaram para gastar, para onde foi esse dinheiro, e se há sinais de irregularidade.`
            : "Todo ano, deputados e senadores têm direito a indicar onde o governo federal deve gastar uma parte do dinheiro público — obras, hospitais, escolas, equipamentos. O parlamentar não recebe esse dinheiro no bolso: ele só aponta o destino, e o governo federal faz o repasse."}
      </p>

      {/* Flow: Reservado → Confirmado → Pago */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Como o dinheiro caminha</p>
        <div className="flex items-start gap-1.5 flex-wrap sm:flex-nowrap">

          {/* Step 1 — Reservado */}
          <div className="flex-1 min-w-[120px] rounded-lg border border-border-default bg-surface-1 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/30 rounded px-1.5 py-0.5">1</span>
              <span className="text-xs font-semibold text-text-primary">Reservado</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              O governo bloqueia a verba no orçamento. O dinheiro ainda não saiu do caixa — é como separar um envelope com o valor escrito.
            </p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center pt-4 px-0.5 text-text-muted shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          {/* Step 2 — Confirmado */}
          <div className="flex-1 min-w-[120px] rounded-lg border border-border-default bg-surface-1 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded px-1.5 py-0.5">2</span>
              <span className="text-xs font-semibold text-text-primary">Confirmado</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              A obra ou serviço foi entregue e o governo atesta o recebimento. Só então o pagamento é autorizado.
            </p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center pt-4 px-0.5 text-text-muted shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          {/* Step 3 — Pago */}
          <div className="flex-1 min-w-[120px] rounded-lg border border-border-default bg-surface-1 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-positive bg-positive/10 border border-positive/30 rounded px-1.5 py-0.5">3</span>
              <span className="text-xs font-semibold text-text-primary">Pago</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              O dinheiro foi transferido de fato para a prefeitura, hospital ou entidade beneficiária.
            </p>
          </div>

        </div>
      </div>

      {/* Gap explanation */}
      <div className="rounded-lg border border-border-default bg-surface-1 px-3 py-2.5 space-y-1">
        <p className="text-sm font-semibold text-text-primary">Por que o valor reservado costuma ser maior que o pago?</p>
        <p className="text-sm text-text-muted leading-relaxed">
          É normal que nem tudo seja pago no mesmo ano: obras em andamento, licitações em curso e processos burocráticos atrasam o repasse — o saldo fica como <strong className="text-text-secondary">"restos a pagar"</strong> e é transferido para o exercício seguinte.
          Uma diferença grande ao longo de <em>vários anos</em> — especialmente em Emenda Pix, que não identifica o destino — merece atenção e fiscalização.
        </p>
      </div>
    </div>
  )
}

// ─── Function bars ────────────────────────────────────────────────────────────

function FunctionBar({ name, committed, count, maxCommitted }: {
  name: string; committed: number; count: number; maxCommitted: number
}) {
  const pct = maxCommitted > 0 ? (committed / maxCommitted) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-text-primary truncate">{name}</span>
        <div className="text-right shrink-0">
          <span className="text-xs font-semibold text-text-secondary tabular-nums">{formatBRL(committed)}</span>
          <span className="text-[10px] text-text-muted ml-1.5">{count} emenda{count !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-bg-raised overflow-hidden">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── AmendmentPanel ───────────────────────────────────────────────────────────

interface AmendmentPanelProps {
  politicianId?: number
  /** Restrict data to a mandate window. Pass the start year of the mandate. */
  yearFrom?: number
  /** Restrict data to a mandate window. Pass the end year of the mandate (omit if still in office). */
  yearTo?: number
}

export function AmendmentPanel({ politicianId, yearFrom, yearTo }: AmendmentPanelProps) {
  const [year, setYear] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)

  // When a specific year is selected, use exact filter; otherwise apply mandate window if set.
  const rangeParams = year
    ? { year }
    : { ...(yearFrom ? { year_from: yearFrom } : {}), ...(yearTo ? { year_to: yearTo } : {}) }

  const summaryParams = { ...rangeParams, ...(politicianId ? { politician_id: politicianId } : {}) }
  const { data: summary, isLoading: summaryLoading } = useAmendmentSummary(summaryParams)

  const listParams = { ...rangeParams, page, ...(politicianId ? { politician_id: politicianId } : {}) }
  const { data: list, isLoading: listLoading } = useAmendments(listParams)

  // Year filter buttons: when a mandate window is set, generate all years in that range;
  // otherwise fall back to the default last-5-years list.
  const availableYears = (yearFrom || yearTo)
    ? Array.from(
        { length: (yearTo ?? CURRENT_YEAR) - (yearFrom ?? CURRENT_YEAR - 4) + 1 },
        (_, i) => (yearTo ?? CURRENT_YEAR) - i
      )
    : YEAR_OPTIONS

  return (
    <div className="space-y-5">

      <ExplainerCard politicianId={politicianId} yearFrom={yearFrom} yearTo={yearTo} />

      {/* Year filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-text-muted">Filtrar por ano:</span>
        {[undefined, ...availableYears].map((y) => (
          <button
            key={y ?? "all"}
            onClick={() => { setYear(y); setPage(1) }}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              year === y
                ? "bg-accent text-black border-accent"
                : "text-text-secondary border-border-default hover:text-text-primary",
            ].join(" ")}
          >
            {y ?? (yearFrom || yearTo
              ? `Todos (${yearFrom ?? ""}${yearFrom && yearTo ? "–" : ""}${yearTo ?? ""})`
              : "Todos")}
          </button>
        ))}
      </div>

      {/* Risk dashboard — shown as soon as summary loads */}
      {summaryLoading ? (
        <div className="rounded-xl border border-border-default p-4 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : summary ? (
        <RiskDashboard summary={summary} year={year} />
      ) : null}

      {/* KPIs */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-default p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total Reservado"
            value={formatBRL(summary.total_committed)}
            description="Verba comprometida do orçamento federal"
          />
          <StatCard
            label="Total Pago"
            value={formatBRL(summary.total_paid)}
            description={
              summary.total_committed > 0
                ? `${((summary.total_paid / summary.total_committed) * 100).toFixed(0)}% do valor reservado transferido`
                : "Sem pagamentos registrados"
            }
          />
          <StatCard
            label="Nº de Emendas"
            value={summary.total_count.toLocaleString("pt-BR")}
            description={
              summary.pix_count > 0
                ? `${summary.pix_count} sem rastreabilidade`
                : "Todas com beneficiário identificado"
            }
          />
        </div>
      ) : null}

      {/* Payment gap */}
      {summary && summary.total_committed > 0 && (
        <PaymentGapCard committed={summary.total_committed} paid={summary.total_paid} />
      )}

      {/* By function */}
      {summary && summary.by_function.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Para onde vai o dinheiro?</CardTitle>
              <CardDescription className="mt-0.5">Áreas de investimento por valor reservado</CardDescription>
            </div>
            <span className="text-xs text-text-muted">Top {Math.min(summary.by_function.length, 8)}</span>
          </CardHeader>
          <div className="space-y-3 px-1 pb-2">
            {summary.by_function.slice(0, 8).map((f) => (
              <FunctionBar
                key={f.function_name}
                name={f.function_name ?? "Área não informada"}
                committed={f.committed_value}
                count={f.count}
                maxCommitted={summary.by_function[0]?.committed_value ?? 1}
              />
            ))}
          </div>
          <SourceFooter year={year} />
        </Card>
      )}

      {/* By type */}
      {summary && summary.by_type.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tipos de emenda</CardTitle>
              <CardDescription className="mt-0.5">Passe o mouse no tipo para entender o que significa</CardDescription>
            </div>
          </CardHeader>
          <div className="divide-y divide-border-default">
            {summary.by_type.map((t) => {
              const isRisky = t.is_pix || (t.amendment_type ? UNCONSTITUTIONAL_TYPES.has(t.amendment_type) : false)
              return (
                <div key={`${t.amendment_type}-${t.is_pix}`} className={[
                  "flex items-center justify-between gap-3 py-3 px-1",
                  isRisky ? "bg-[#f59e0b]/3" : "",
                ].join(" ")}>
                  <TypeBadge type={t.amendment_type ?? "Não informado"} isPix={t.is_pix} />
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-text-primary tabular-nums">{formatBRL(t.committed_value)}</p>
                    <p className="text-[10px] text-text-muted">{t.count} emenda{t.count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <SourceFooter year={year} />
        </Card>
      )}

      {/* Amendment list */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Emendas individuais</CardTitle>
            <CardDescription className="mt-0.5">
              Badges coloridos indicam pontos de atenção · vermelho = risco alto · amarelo = requer acompanhamento
            </CardDescription>
          </div>
          {list && (
            <span className="text-xs text-text-muted">{list.total.toLocaleString("pt-BR")} emendas</span>
          )}
        </CardHeader>

        {listLoading ? (
          <div className="divide-y divide-border-default">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3 px-1">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-2 w-full mt-1" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : !list || list.items.length === 0 ? (
          <EmptyState
            title="Nenhuma emenda encontrada"
            description={
              politicianId
                ? "Este parlamentar não possui emendas registradas no período."
                : "Não há emendas registradas para o período selecionado."
            }
            icon={
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
          />
        ) : (
          <>
            <div className="divide-y divide-border-default">
              {list.items.map((a) => {
                const risks = computeAmendmentRisks(a)
                const hasRisk = risks.length > 0
                const hasCritical = risks.some((r) => r.severity === "critical")
                const paidPct = a.committed_value > 0 ? (a.paid_value / a.committed_value) * 100 : 0

                return (
                  <div
                    key={a.id}
                    className={[
                      "py-3.5 px-1 space-y-2 transition-colors",
                      hasCritical ? "bg-danger/3" : hasRisk ? "bg-[#f59e0b]/3" : "",
                    ].join(" ")}
                  >
                    {/* Row 1: type + risk badges + function + value */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {a.amendment_type && (
                          <TypeBadge type={a.amendment_type} isPix={a.is_pix} />
                        )}
                        {risks.map((r, i) => <RiskBadge key={i} risk={r} />)}
                        {a.function_name && (
                          <span className="text-sm text-text-primary">{a.function_name}</span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-accent tabular-nums">{formatBRL(a.committed_value)}</p>
                        <p className="text-[10px] text-text-muted">reservado</p>
                      </div>
                    </div>

                    {/* Row 2: locality + year + paid info + source link */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-text-muted flex-wrap">
                        {a.locality && (
                          <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {a.locality}
                          </span>
                        )}
                        <span>{a.year}</span>
                        {a.subfunction_name && (
                          <span className="hidden sm:inline">· {a.subfunction_name}</span>
                        )}
                        {a.paid_value > 0 ? (
                          <span className="text-accent">· pago: {formatBRL(a.paid_value)}</span>
                        ) : a.committed_value > 100_000 ? (
                          <span className="text-[#f59e0b]">· ainda não pago</span>
                        ) : null}
                      </div>
                      <a
                        href={`${SOURCE_URL}?ano=${a.year}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-text-muted hover:text-accent flex items-center gap-0.5 transition-colors shrink-0"
                      >
                        Ver fonte
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>

                    {/* Row 3: mini payment bar */}
                    {a.committed_value > 0 && (
                      <div className="space-y-0.5">
                        <div className="h-1 rounded-full bg-bg-raised overflow-hidden">
                          <div
                            className={[
                              "h-full rounded-full transition-all duration-500",
                              paidPct < 20 ? "bg-danger" : paidPct < 60 ? "bg-[#f59e0b]" : "bg-accent",
                            ].join(" ")}
                            style={{ width: `${Math.min(paidPct, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-text-muted">
                          {paidPct.toFixed(0)}% pago
                          {a.committed_value - a.paid_value > 0 && (
                            <> · <span className={paidPct < 20 ? "text-danger" : "text-[#f59e0b]"}>
                              {formatBRL(a.committed_value - a.paid_value)} pendente
                            </span></>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {list.total > list.page_size && (
              <div className="pt-4 border-t border-border-default">
                <Pagination page={page} total={list.total} pageSize={list.page_size} onPageChange={setPage} />
              </div>
            )}
            <SourceFooter year={year} />
          </>
        )}
      </Card>
    </div>
  )
}
