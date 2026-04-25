"use client"

import Link from "next/link"
import { MonthlyCostsChart } from "@/components/features/monthly-costs-chart"

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-5 space-y-3"
      style={{ borderColor: "#1a2e1a", backgroundColor: "#0b140b" }}
    >
      {children}
    </div>
  )
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base leading-none mt-0.5">{icon}</span>
      <span className="text-sm text-text-secondary leading-relaxed">{text}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-text-primary">{children}</h2>
  )
}

export default function CustosPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/"
          className="mt-1.5 text-text-muted hover:text-text-primary transition-colors shrink-0"
          aria-label="Voltar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Custos da Máquina Pública</h1>
          <p className="text-text-secondary mt-1">
            Quanto o governo federal gasta todo mês — em números reais, sem enrolação.
          </p>
        </div>
      </div>

      {/* ── CEAP section ─────────────────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <SectionTitle>Verba dos Deputados (CEAP)</SectionTitle>
          <p className="text-sm text-text-muted mt-0.5">
            Câmara dos Deputados · 513 deputados federais
          </p>
        </div>

        {/* Explainer */}
        <InfoBox>
          <p className="text-sm font-semibold text-text-primary">O que é a CEAP?</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Todo deputado federal recebe todo mês uma quantia em dinheiro para pagar as
            despesas do seu trabalho. O governo deposita esse valor, o deputado gasta e
            apresenta os comprovantes para ser reembolsado. Isso se chama{" "}
            <strong className="text-text-primary">
              CEAP — Cota para Exercício da Atividade Parlamentar
            </strong>
            .
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            O gráfico abaixo mostra o <strong className="text-text-primary">total de reembolsos aprovados</strong>{" "}
            em cada mês, somando todos os 513 deputados.
          </p>
        </InfoBox>

        {/* What's included */}
        <InfoBox>
          <p className="text-sm font-semibold text-text-primary">O que pode ser pago com essa verba?</p>
          <div className="grid sm:grid-cols-2 gap-2 pt-1">
            <InfoRow icon="✈️" text="Passagens aéreas e terrestres" />
            <InfoRow icon="⛽" text="Combustível e aluguel de carro" />
            <InfoRow icon="🍽️" text="Alimentação" />
            <InfoRow icon="🏨" text="Hotel e hospedagem" />
            <InfoRow icon="📦" text="Material de escritório" />
            <InfoRow icon="📱" text="Telefone e internet" />
            <InfoRow icon="🖨️" text="Gráfica e publicações" />
            <InfoRow icon="💧" text="Água, energia e gás do escritório" />
          </div>
        </InfoBox>

        {/* Key numbers */}
        <InfoBox>
          <p className="text-sm font-semibold text-text-primary">Números importantes</p>
          <InfoRow
            icon="💰"
            text="Cada deputado tem um limite mensal de R$ 30.788 a R$ 46.744 — o valor varia conforme a distância entre o estado e Brasília. Quem mora longe tem limite maior por causa das passagens."
          />
          <InfoRow
            icon="⚠️"
            text="Isso NÃO é o salário do deputado. O salário (subsídio) é fixo em R$ 46.366 por mês e é pago separadamente para todos os 513 deputados."
          />
          <InfoRow
            icon="📋"
            text="Todos os gastos são públicos e auditados. Qualquer reembolso sem comprovante válido deve ser devolvido."
          />
        </InfoBox>

        {/* Chart */}
        <MonthlyCostsChart />
      </section>

      {/* ── Coming soon sections ──────────────────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>Em breve</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Salários dos Deputados", desc: "R$ 46.366/mês × 513 deputados — custo fixo mensal da folha da Câmara" },
            { label: "Cartão Corporativo (CPGF)", desc: "Gastos no cartão de crédito do governo federal — Presidência e ministérios" },
            { label: "Emendas Parlamentares", desc: "Dinheiro que cada deputado destina para obras e projetos em sua base eleitoral" },
            { label: "Folha dos Servidores", desc: "Custo total com servidores públicos federais ativos" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border p-4 opacity-50"
              style={{ borderColor: "#1a2e1a", backgroundColor: "#0b140b" }}
            >
              <p className="text-sm font-semibold text-text-secondary">{item.label}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
