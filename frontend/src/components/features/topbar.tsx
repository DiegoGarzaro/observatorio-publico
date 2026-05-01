import Link from "next/link"

export function Topbar() {
  return (
    <header className="h-14 border-b border-border-default bg-bg-surface sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-accent font-mono text-lg font-bold tracking-tight group-hover:brightness-110 transition-all">
            {"<"}obs{"/>"}
          </span>
          <span className="text-text-primary font-semibold text-sm hidden sm:block">
            Observatório Público
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/eleicoes/2026"
            className="px-3 py-1.5 rounded text-[#9ffe57] hover:bg-[#9ffe57]/10 transition-colors font-medium text-xs"
          >
            Eleições &apos;26
          </Link>
          <Link
            href="/custos"
            className="px-3 py-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-bg-raised transition-colors"
          >
            Custos
          </Link>
          <Link
            href="/compare"
            className="px-3 py-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-bg-raised transition-colors"
          >
            Comparar
          </Link>
          <a
            href="https://dadosabertos.camara.leg.br"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded text-text-muted hover:text-text-secondary transition-colors text-xs"
          >
            Fonte ↗
          </a>
        </nav>
      </div>
    </header>
  )
}
