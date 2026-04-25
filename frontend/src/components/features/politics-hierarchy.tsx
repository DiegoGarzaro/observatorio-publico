"use client"

import Link from "next/link"
import { useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface GovNode {
  id: string
  label: string
  seats?: string
  tooltip?: string
  href?: string
  available?: boolean
  children?: GovNode[]
}

interface Branch {
  id: "legislativo" | "executivo" | "judiciario"
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  nodes: GovNode[]
}

interface Level {
  id: "federal" | "estadual" | "municipal"
  label: string
  shortLabel: string
  branches: Branch[]
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconLegislativo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20M4 20V10l8-6 8 6v10M9 20v-6h6v6" />
    </svg>
  )
}

function IconExecutivo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
    </svg>
  )
}

function IconJudiciario({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 9l9-6 9 6M5 20h14" />
      <path d="M5 12l-2 5h4L5 12zM19 12l-2 5h4L19 12z" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ─── Government data ──────────────────────────────────────────────────────────

const LEVELS: Level[] = [
  {
    id: "federal",
    label: "Governo Federal",
    shortLabel: "Federal",
    branches: [
      {
        id: "legislativo",
        label: "Legislativo",
        icon: <IconLegislativo color="#57c4ff" />,
        color: "#57c4ff",
        bgColor: "#07141d",
        borderColor: "#0e2a3d",
        nodes: [
          {
            id: "congresso",
            label: "Congresso Nacional",
            tooltip: "Elabora e aprova as leis do país",
            href: "/congresso",
            available: true,
            children: [
              {
                id: "camara",
                label: "Câmara dos Deputados",
                seats: "513 deputados",
                tooltip: "Representa o povo — deputados eleitos por estado",
                href: "/deputados",
                available: true,
              },
              {
                id: "senado",
                label: "Senado Federal",
                seats: "81 senadores",
                tooltip: "Representa os estados — 3 senadores por UF",
                href: "/senadores",
                available: true,
              },
            ],
          },
        ],
      },
      {
        id: "executivo",
        label: "Executivo",
        icon: <IconExecutivo color="#9ffe57" />,
        color: "#9ffe57",
        bgColor: "#0a120a",
        borderColor: "#162416",
        nodes: [
          {
            id: "presidente",
            label: "Presidente da República",
            seats: "1 cargo",
            tooltip: "Chefe de Estado e de Governo — eleito pelo voto direto",
            href: "/presidentes",
            available: true,
            children: [
              {
                id: "vp",
                label: "Vice-Presidente",
                tooltip: "Assume em caso de impedimento do Presidente",
                href: "/vice-presidentes",
                available: true,
              },
              {
                id: "ministerios",
                label: "Ministérios",
                tooltip: "26 ministérios + Casa Civil coordenam a administração federal",
                href: "/ministerios",
                available: true,
              },
            ],
          },
        ],
      },
      {
        id: "judiciario",
        label: "Judiciário",
        icon: <IconJudiciario color="#c084fc" />,
        color: "#c084fc",
        bgColor: "#110b1d",
        borderColor: "#25144a",
        nodes: [
          {
            id: "judiciario-overview",
            label: "Judiciário Federal",
            tooltip: "Visão geral dos tribunais federais — STF, STJ, TSE, STM e TST",
            href: "/judiciario",
            available: true,
            children: [
              {
                id: "stf",
                label: "Supremo Tribunal Federal",
                seats: "11 ministros",
                tooltip: "Guarda da Constituição — última instância judicial",
                href: "/stf",
                available: true,
              },
              {
                id: "stj",
                label: "STJ · TSE · STM · TST",
                tooltip: "Tribunais superiores: Superior Tribunal de Justiça, Tribunal Superior Eleitoral, Superior Tribunal Militar, Tribunal Superior do Trabalho",
                href: "/tribunais-superiores",
                available: true,
              },
              {
                id: "trf",
                label: "Tribunais Federais",
                tooltip: "TRF1 ao TRF6 — 2ª instância da Justiça Federal",
                href: "/tribunais-federais",
                available: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "estadual",
    label: "Governo Estadual",
    shortLabel: "Estadual",
    branches: [
      {
        id: "legislativo",
        label: "Legislativo",
        icon: <IconLegislativo color="#57c4ff" />,
        color: "#57c4ff",
        bgColor: "#07141d",
        borderColor: "#0e2a3d",
        nodes: [
          {
            id: "assembleias",
            label: "Assembleias Legislativas",
            seats: "1.059 dep. estaduais",
            tooltip: "Uma por estado — elaboram leis estaduais (DF: Câmara Legislativa)",
            href: "/assembleias",
            available: true,
          },
        ],
      },
      {
        id: "executivo",
        label: "Executivo",
        icon: <IconExecutivo color="#9ffe57" />,
        color: "#9ffe57",
        bgColor: "#0a120a",
        borderColor: "#162416",
        nodes: [
          {
            id: "governador",
            label: "Governador",
            seats: "27 cargos",
            tooltip: "Eleito pelo voto direto — gerencia o estado por 4 anos",
            href: "/governadores",
            available: true,
            children: [
              {
                id: "secretarias-est",
                label: "Secretarias Estaduais",
                tooltip: "Equivalentes estaduais dos ministérios federais",
                href: "/secretarias-estaduais",
                available: true,
              },
            ],
          },
        ],
      },
      {
        id: "judiciario",
        label: "Judiciário",
        icon: <IconJudiciario color="#c084fc" />,
        color: "#c084fc",
        bgColor: "#110b1d",
        borderColor: "#25144a",
        nodes: [
          {
            id: "tjs",
            label: "Tribunais de Justiça",
            seats: "27 TJs",
            tooltip: "Um TJ por estado — 2ª instância da Justiça estadual",
            href: "/tribunais-justica",
            available: true,
          },
          {
            id: "varas-est",
            label: "Varas de 1ª Instância",
            tooltip: "Juízes estaduais que julgam casos pela primeira vez",
            href: "/varas-primeira-instancia",
            available: true,
          },
        ],
      },
    ],
  },
  {
    id: "municipal",
    label: "Governo Municipal",
    shortLabel: "Municipal",
    branches: [
      {
        id: "legislativo",
        label: "Legislativo",
        icon: <IconLegislativo color="#57c4ff" />,
        color: "#57c4ff",
        bgColor: "#07141d",
        borderColor: "#0e2a3d",
        nodes: [
          {
            id: "camaras",
            label: "Câmaras Municipais",
            seats: "59.000+ vereadores",
            tooltip: "Uma por município — elaboram leis e fiscalizam a prefeitura",
            href: "/camaras-municipais",
            available: true,
          },
        ],
      },
      {
        id: "executivo",
        label: "Executivo",
        icon: <IconExecutivo color="#9ffe57" />,
        color: "#9ffe57",
        bgColor: "#0a120a",
        borderColor: "#162416",
        nodes: [
          {
            id: "prefeito",
            label: "Prefeito",
            seats: "5.570 cargos",
            tooltip: "Eleito por voto direto para administrar o município",
            available: true,
            href: "/prefeitos",
            children: [
              {
                id: "secretarias-mun",
                label: "Secretarias Municipais",
                tooltip: "Saúde, Educação, Obras, Transporte e demais secretarias",
                available: true,
                href: "/secretarias-municipais",
              },
            ],
          },
        ],
      },
      {
        id: "judiciario",
        label: "Judiciário",
        icon: <IconJudiciario color="#c084fc" />,
        color: "#c084fc",
        bgColor: "#110b1d",
        borderColor: "#25144a",
        nodes: [
          {
            id: "varas-mun",
            label: "Varas de 1ª Instância",
            tooltip: "Varas do Trabalho, Juntas Eleitorais, Varas Cíveis e Criminais",
            href: "/varas-primeira-instancia",
            available: true,
          },
        ],
      },
    ],
  },
]

// ─── Node component ────────────────────────────────────────────────────────────

interface NodeCardProps {
  node: GovNode
  color: string
  isChild?: boolean
}

function NodeCard({ node, color, isChild = false }: NodeCardProps) {
  const inner = (
    <div
      className="group/card relative flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all duration-200"
      style={{
        borderColor: node.available ? `${color}30` : "#1a2320",
        backgroundColor: node.available ? `${color}08` : "#0b130b",
      }}
      title={node.tooltip}
      onMouseEnter={(e) => {
        if (node.available) {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${color}60`
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = `${color}12`
        }
      }}
      onMouseLeave={(e) => {
        if (node.available) {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${color}30`
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = `${color}08`
        }
      }}
    >
      {/* Color dot */}
      <div
        className="shrink-0 rounded-full transition-all"
        style={{
          width: isChild ? 5 : 7,
          height: isChild ? 5 : 7,
          backgroundColor: node.available ? color : "#2a3830",
        }}
      />

      <div className="flex-1 min-w-0">
        <p
          className="font-medium leading-tight truncate"
          style={{
            fontSize: isChild ? "0.72rem" : "0.78rem",
            color: node.available ? "#d4f0c8" : "#374c37",
          }}
        >
          {node.label}
        </p>
        {node.seats && (
          <p
            className="text-[10px] tabular-nums mt-0.5"
            style={{ color: node.available ? `${color}90` : "#2a3830" }}
          >
            {node.seats}
          </p>
        )}
      </div>

      {node.available ? (
        <svg
          className="shrink-0 opacity-0 group/card-hover:opacity-100 transition-opacity"
          style={{ opacity: 0.4, color }}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      ) : (
        <span style={{ color: "#2a3830", opacity: 0.6 }}>
          <IconLock />
        </span>
      )}
    </div>
  )

  if (node.available && node.href) {
    return <Link href={node.href}>{inner}</Link>
  }
  return <div className={node.available ? undefined : "cursor-default"}>{inner}</div>
}

// ─── Tree node (node + optional children with connector lines) ─────────────────

interface TreeNodeProps {
  node: GovNode
  color: string
  depth?: number
}

function TreeNode({ node, color, depth = 0 }: TreeNodeProps) {
  if (!node.children || node.children.length === 0) {
    return <NodeCard node={node} color={color} isChild={depth > 0} />
  }

  return (
    <div className="space-y-1.5">
      <NodeCard node={node} color={color} isChild={depth > 0} />

      {/* Children with connector lines */}
      <div className="ml-3 pl-3 space-y-1.5 relative">
        {/* Vertical guide line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{ backgroundColor: `${color}20` }}
        />

        {node.children.map((child) => (
          <div key={child.id} className="relative">
            {/* Horizontal branch line */}
            <div
              className="absolute left-0 top-4 w-2.5 h-px"
              style={{ backgroundColor: `${color}20` }}
            />
            <div className="pl-3">
              <TreeNode node={child} color={color} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Branch column ────────────────────────────────────────────────────────────

function BranchColumn({ branch }: { branch: Branch }) {
  return (
    <div
      className="flex flex-col rounded-xl border overflow-hidden"
      style={{ borderColor: branch.borderColor, backgroundColor: branch.bgColor }}
    >
      {/* Branch header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: branch.borderColor }}
      >
        {branch.icon}
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: branch.color }}
        >
          {branch.label}
        </span>
      </div>

      {/* Nodes */}
      <div className="p-3 space-y-2 flex-1">
        {branch.nodes.map((node) => (
          <TreeNode key={node.id} node={node} color={branch.color} />
        ))}
      </div>
    </div>
  )
}

// ─── Level tabs ───────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<Level["id"], string> = {
  federal: "#9ffe57",
  estadual: "#57c4ff",
  municipal: "#ffd557",
}

function LevelTabs({
  levels,
  activeId,
  onChange,
}: {
  levels: Level[]
  activeId: Level["id"]
  onChange: (id: Level["id"]) => void
}) {
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "#0b130b" }}>
      {levels.map((level) => {
        const isActive = level.id === activeId
        const color = LEVEL_COLORS[level.id]
        return (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className="flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition-all duration-200"
            style={
              isActive
                ? {
                    backgroundColor: `${color}15`,
                    color,
                    boxShadow: `0 0 0 1px ${color}40`,
                  }
                : {
                    color: "#3d5c3d",
                    backgroundColor: "transparent",
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = color
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}08`
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = "#3d5c3d"
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
              }
            }}
          >
            {level.shortLabel}
          </button>
        )
      })}
    </div>
  )
}

// ─── PoliticsHierarchy ────────────────────────────────────────────────────────

export function PoliticsHierarchy() {
  const [activeId, setActiveId] = useState<Level["id"]>("federal")
  const activeLevel = LEVELS.find((l) => l.id === activeId)!

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div>
        <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Estrutura Política
        </h2>
        <p className="text-text-secondary text-sm mt-0.5">
          Como o poder público brasileiro é organizado
        </p>
      </div>

      {/* Level selector */}
      <LevelTabs
        levels={LEVELS}
        activeId={activeId}
        onChange={setActiveId}
      />

      {/* Level label */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: `${LEVEL_COLORS[activeId]}18` }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: `${LEVEL_COLORS[activeId]}70` }}
        >
          {activeLevel.label}
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: `${LEVEL_COLORS[activeId]}18` }} />
      </div>

      {/* Three branches */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {activeLevel.branches.map((branch) => (
          <BranchColumn key={branch.id} branch={branch} />
        ))}
      </div>

      {/* Voters footer */}
      <div
        className="flex items-center justify-center gap-3 rounded-xl border px-4 py-3"
        style={{ borderColor: "#161e16", backgroundColor: "#090e09" }}
      >
        <div className="h-px flex-1" style={{ backgroundColor: "#1e2e1e" }} />
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d5c3d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#3d5c3d" }}>
            Os eleitores elegem os representantes
          </span>
        </div>
        <div className="h-px flex-1" style={{ backgroundColor: "#1e2e1e" }} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#9ffe57" }} />
          <span className="text-[10px]" style={{ color: "#3d5c3d" }}>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2a3830" }} />
          <span className="text-[10px]" style={{ color: "#3d5c3d" }}>Em breve</span>
        </div>
      </div>
    </section>
  )
}
