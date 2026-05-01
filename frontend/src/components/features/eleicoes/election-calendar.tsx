"use client"

interface Milestone {
  date: Date
  shortDate: string
  label: string
  detail: string
}

const ACCENT = "#9ffe57"
const YELLOW = "#ffd557"
const MUTED_BORDER = "#1a2e1a"
const MUTED_BG = "#0b140b"

const MILESTONES: Milestone[] = [
  {
    date: new Date(2026, 3, 4),
    shortDate: "4 abr",
    label: "Filiação partidária",
    detail: "Prazo final para o candidato estar filiado a um partido (6 meses antes da eleição).",
  },
  {
    date: new Date(2026, 7, 5),
    shortDate: "5 ago",
    label: "Convenções partidárias",
    detail: "Os partidos escolhem oficialmente seus candidatos e coligações.",
  },
  {
    date: new Date(2026, 7, 15),
    shortDate: "15 ago",
    label: "Registro de candidatura",
    detail: "Prazo final para registrar a candidatura no TSE. A partir daqui a lista é pública.",
  },
  {
    date: new Date(2026, 9, 4),
    shortDate: "4 out",
    label: "1º Turno",
    detail: "Eleição em todo o país. Resultado definitivo para deputados, e para presidente/governador se houver maioria absoluta.",
  },
  {
    date: new Date(2026, 9, 25),
    shortDate: "25 out",
    label: "2º Turno",
    detail: "Disputa entre os dois mais votados para presidente e governadores, quando ninguém atinge 50%+1 no 1º turno.",
  },
]

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function ElectionCalendar() {
  const today = startOfToday()
  const isPast = (m: Milestone) => m.date.getTime() < today.getTime()
  const nextIdx = MILESTONES.findIndex((m) => !isPast(m))
  const currentPosition = nextIdx === -1 ? MILESTONES.length : nextIdx

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Calendário eleitoral
        </h2>
        <span className="text-[10px] text-text-muted tabular-nums">
          Hoje:{" "}
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Horizontal stepper */}
      <div
        className="rounded-xl border p-5"
        style={{ borderColor: MUTED_BORDER, backgroundColor: MUTED_BG }}
      >
        <ol className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-0 relative">
          {MILESTONES.map((m, i) => {
            const past = isPast(m)
            const isLast = i === MILESTONES.length - 1
            const isCurrent = i === currentPosition

            return (
              <li
                key={m.shortDate}
                className="relative flex flex-col items-start sm:items-center text-left sm:text-center"
              >
                {/* Connector line (desktop only, between dots) */}
                {!isLast && (
                  <div
                    className="hidden sm:block absolute top-[7px] left-1/2 right-0 h-px -z-0"
                    style={{
                      backgroundColor: i < currentPosition ? `${ACCENT}40` : "#1a2e1a",
                      width: "100%",
                    }}
                  />
                )}

                {/* Dot */}
                <div
                  className="relative z-10 rounded-full flex items-center justify-center"
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: past ? ACCENT : isCurrent ? YELLOW : MUTED_BG,
                    border: `2px solid ${past ? ACCENT : isCurrent ? YELLOW : "#2a3830"}`,
                    boxShadow: isCurrent ? `0 0 0 4px ${YELLOW}20` : "none",
                  }}
                >
                  {past && (
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0b140b"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                {/* Date + label */}
                <div className="mt-2 sm:mt-2.5 space-y-0.5">
                  <p
                    className="text-[11px] font-semibold tabular-nums"
                    style={{
                      color: past ? ACCENT : isCurrent ? YELLOW : "#6b8f6b",
                    }}
                  >
                    {m.shortDate}
                  </p>
                  <p
                    className="text-[11px] leading-tight"
                    style={{ color: past ? "#a8d189" : isCurrent ? "#d4f0c8" : "#5a7a5a" }}
                  >
                    {m.label}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        {/* Current step detail */}
        {currentPosition < MILESTONES.length && (
          <div
            className="mt-5 pt-4 border-t text-xs text-text-secondary leading-relaxed"
            style={{ borderColor: MUTED_BORDER }}
          >
            <span className="font-semibold" style={{ color: YELLOW }}>
              Próximo marco:
            </span>{" "}
            <span className="font-medium text-text-primary">
              {MILESTONES[currentPosition].label}
            </span>{" "}
            — {MILESTONES[currentPosition].detail}
          </div>
        )}
      </div>
    </section>
  )
}
