import useSWR from "swr"
import { api } from "./api"
import type { AmendmentSummary, CardExpenseSummary, CompareResponse, GlobalExpenseSummary, NewsResponse, PaginatedAmendments, PaginatedCardExpenses, PaginatedResponse, PoliticianListItem, PoliticianWithMetrics, Politician, ExpenseSummary, Party, PresenceStats, Proposition, SenatorDetail, Vote } from "@/types"

// ─── Politicians ──────────────────────────────────────────────────────────────

interface UsePoliticiansParams {
  name?: string
  party?: string
  uf?: string
  municipality?: string
  role?: string
  page?: number
  page_size?: number
}

export function usePoliticians(params: UsePoliticiansParams) {
  const key = ["politicians", params]
  return useSWR<PaginatedResponse<PoliticianListItem>>(key, () =>
    api.politicians.list(params)
  )
}

interface UsePoliticiansWithMetricsParams {
  name?: string
  party?: string
  uf?: string
  role?: string
  page?: number
  page_size?: number
}

export function usePoliticiansWithMetrics(params: UsePoliticiansWithMetricsParams) {
  const key = ["politicians-with-metrics", params]
  return useSWR<PaginatedResponse<PoliticianWithMetrics>>(key, () =>
    api.politicians.listWithMetrics(params)
  )
}

export function usePolitician(id: number | null) {
  return useSWR<Politician>(
    id ? ["politician", id] : null,
    () => api.politicians.get(id!)
  )
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function useExpenseSummary(politicianId: number, year?: number) {
  const key = ["expenses-summary", politicianId, year]
  return useSWR<ExpenseSummary>(key, () =>
    api.politicians.expensesSummary(politicianId, { year })
  )
}

export function useExpenses(politicianId: number, params: { year?: number; page?: number }) {
  const key = ["expenses", politicianId, params]
  return useSWR(key, () => api.politicians.expenses(politicianId, params))
}

// ─── Parties ──────────────────────────────────────────────────────────────────

export function useParties() {
  return useSWR<Party[]>("parties", () => api.parties.list())
}

// ─── Propositions ─────────────────────────────────────────────────────────────

export function usePropositions(
  politicianId: number,
  params: { prop_type?: string; year?: number; page?: number }
) {
  const key = ["propositions", politicianId, params]
  return useSWR<PaginatedResponse<Proposition>>(key, () =>
    api.politicians.propositions(politicianId, { ...params, page_size: 20 })
  )
}

// ─── Votes ────────────────────────────────────────────────────────────────────

export function useVotes(
  politicianId: number,
  params: { year?: number; direction?: string; page?: number }
) {
  const key = ["votes", politicianId, params]
  return useSWR<PaginatedResponse<Vote>>(key, () =>
    api.politicians.votes(politicianId, { ...params, page_size: 20 })
  )
}

export function usePresenceStats(politicianId: number, year?: number) {
  const key = ["presence-stats", politicianId, year]
  return useSWR<PresenceStats>(key, () =>
    api.politicians.presenceStats(politicianId, { year })
  )
}

// ─── Compare ──────────────────────────────────────────────────────────────────

export function useCompare(ids: number[]) {
  const key = ids.length >= 2 ? ["compare", ids.join(",")] : null
  return useSWR<CompareResponse>(key, () => api.compare.get(ids))
}

// ─── Senator detail ───────────────────────────────────────────────────────────

export function useSenatorDetail(id: number | null) {
  return useSWR<SenatorDetail>(
    id ? ["senator-detail", id] : null,
    () => api.politicians.senatorDetail(id!)
  )
}

// ─── News ─────────────────────────────────────────────────────────────────────

export function useNews(politicianId: number) {
  return useSWR<NewsResponse>(["news", politicianId], () =>
    api.politicians.news(politicianId)
  )
}

// ─── Amendments ───────────────────────────────────────────────────────────────

export function useAmendmentSummary(params: { year?: number; year_from?: number; year_to?: number; politician_id?: number }) {
  const key = ["amendment-summary", params]
  return useSWR<AmendmentSummary>(key, () => api.transparency.amendmentSummary(params))
}

export function useAmendments(params: {
  politician_id?: number
  year?: number
  year_from?: number
  year_to?: number
  page?: number
}) {
  const key = ["amendments", params]
  return useSWR<PaginatedAmendments>(key, () =>
    api.transparency.amendments({ ...params, page_size: 20 })
  )
}

// ─── Card Expenses ────────────────────────────────────────────────────────────

export function useCardExpenseSummary(organ_code: string, year?: number) {
  const key = ["card-expense-summary", organ_code, year]
  return useSWR<CardExpenseSummary>(key, () =>
    api.transparency.cardExpenseSummary({ organ_code, year })
  )
}

export function useCardExpenses(params: {
  organ_code: string
  year?: number
  page?: number
}) {
  const key = ["card-expenses", params]
  return useSWR<PaginatedCardExpenses>(key, () =>
    api.transparency.cardExpenses({ ...params, page_size: 20 })
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useGlobalExpenseSummary(year?: number) {
  const key = ["global-expense-summary", year]
  return useSWR<GlobalExpenseSummary>(key, () => api.stats.expensesOverview({ year }))
}

// ─── Role timeline ────────────────────────────────────────────────────────────

export function useRoleTimeline(role: string) {
  return useSWR<Politician[]>(["role-timeline", role], async () => {
    const { items } = await api.politicians.list({ role, page_size: 100 })
    const details = await Promise.all(items.map((p) => api.politicians.get(p.id)))
    return details
  })
}
