"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Avatar, Badge, Card } from "@/components/ui"
import { formatCurrency } from "@/lib/utils"
import type { PoliticianCompareItem } from "@/types"

interface ComparePanelProps {
  items: PoliticianCompareItem[]
}

const COLORS = ["#9ffe57", "#57c4ff", "#ff9b57", "#ff5794"]

function shortName(name: string): string {
  const parts = name.split(" ")
  if (parts.length <= 2) return name
  return `${parts[0]} ${parts[parts.length - 1]}`
}

export function ComparePanel({ items }: ComparePanelProps) {
  const expenseData = items.map((p, i) => ({
    name: shortName(p.name),
    value: p.total_expenses,
    fill: COLORS[i],
  }))

  const propositionData = items.map((p, i) => ({
    name: shortName(p.name),
    value: p.proposition_count,
    fill: COLORS[i],
  }))

  const presenceData = items.map((p, i) => ({
    name: shortName(p.name),
    value: p.presence_rate,
    fill: COLORS[i],
  }))

  return (
    <div className="space-y-8">
      {/* Header cards per politician */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((p, i) => (
          <Card key={p.id} className="text-center">
            <div className="flex flex-col items-center gap-3 p-2">
              <div
                className="h-8 rounded-full mb-1"
                style={{ backgroundColor: COLORS[i], width: 4 }}
              />
              <Avatar src={p.photo_url} name={p.name} size="lg" />
              <div>
                <p className="text-sm font-semibold text-text-primary leading-tight">
                  {p.name}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                  {p.party && <Badge variant="accent">{p.party}</Badge>}
                  {p.uf && <Badge variant="default">{p.uf}</Badge>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* KPI comparison table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-3 pr-4 text-xs font-medium text-text-secondary uppercase tracking-wider w-40">
                  Indicador
                </th>
                {items.map((p, i) => (
                  <th
                    key={p.id}
                    className="py-3 px-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider"
                  >
                    <span style={{ color: COLORS[i] }}>{shortName(p.name)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              <tr>
                <td className="py-3 pr-4 text-text-muted text-xs">Total Gasto (CEAP)</td>
                {items.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-center font-mono text-text-primary font-semibold">
                    {formatCurrency(p.total_expenses)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-text-muted text-xs">Proposições</td>
                {items.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-center font-mono text-text-primary font-semibold">
                    {p.proposition_count}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-text-muted text-xs">Taxa de Presença</td>
                {items.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-center font-mono font-semibold"
                    style={{ color: p.presence_rate >= 80 ? "#9ffe57" : p.presence_rate >= 60 ? "#ffdd57" : "#ff5794" }}
                  >
                    {p.presence_rate.toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-text-muted text-xs">Total de Votos</td>
                {items.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-center font-mono text-text-primary font-semibold">
                    {p.total_votes}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-4">
            Total Gasto (CEAP)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={expenseData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#8b9cb6", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8b9cb6", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(Number(v) / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ background: "#1a1d23", border: "1px solid #2a2d35", borderRadius: 6 }}
                labelStyle={{ color: "#c4d0e3", fontWeight: 600 }}
                itemStyle={{ color: "#8b9cb6" }}
                formatter={(v) => [formatCurrency(Number(v)), "Total"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {expenseData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-4">
            Proposições
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={propositionData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#8b9cb6", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8b9cb6", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: "#1a1d23", border: "1px solid #2a2d35", borderRadius: 6 }}
                labelStyle={{ color: "#c4d0e3", fontWeight: 600 }}
                itemStyle={{ color: "#8b9cb6" }}
                formatter={(v) => [v, "Proposições"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {propositionData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-4">
            Taxa de Presença (%)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={presenceData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#8b9cb6", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#8b9cb6", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ background: "#1a1d23", border: "1px solid #2a2d35", borderRadius: 6 }}
                labelStyle={{ color: "#c4d0e3", fontWeight: 600 }}
                itemStyle={{ color: "#8b9cb6" }}
                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Presença"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {presenceData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
