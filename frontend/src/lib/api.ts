import type { AmendmentSummary, CardExpenseSummary, CompareResponse, Expense, ExpenseSummary, GlobalExpenseSummary, NewsResponse, PaginatedAmendments, PaginatedCardExpenses, PaginatedResponse, Party, Politician, PoliticianListItem, PresenceStats, Proposition, SenatorDetail, Vote } from "@/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

async function fetcher<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const res = await fetch(url.toString())

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erro desconhecido" }))
    throw new Error(error.detail ?? `Erro ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  politicians: {
    list: (params?: {
      name?: string
      party?: string
      uf?: string
      municipality?: string
      role?: string
      page?: number
      page_size?: number
    }) => fetcher<PaginatedResponse<PoliticianListItem>>("/politicians", params),

    get: (id: number) => fetcher<Politician>(`/politicians/${id}`),

    expenses: (id: number, params?: { year?: number; month?: number; page?: number }) =>
      fetcher<PaginatedResponse<Expense>>(`/politicians/${id}/expenses`, params),

    expensesSummary: (id: number, params?: { year?: number }) =>
      fetcher<ExpenseSummary>(`/politicians/${id}/expenses/summary`, params),

    propositions: (id: number, params?: { prop_type?: string; year?: number; page?: number; page_size?: number }) =>
      fetcher<PaginatedResponse<Proposition>>(`/politicians/${id}/propositions`, params),

    votes: (id: number, params?: { year?: number; direction?: string; page?: number; page_size?: number }) =>
      fetcher<PaginatedResponse<Vote>>(`/politicians/${id}/votes`, params),

    presenceStats: (id: number, params?: { year?: number }) =>
      fetcher<PresenceStats>(`/politicians/${id}/votes/presence`, params),

    senatorDetail: (id: number) =>
      fetcher<SenatorDetail>(`/politicians/${id}/senator-detail`),

    news: (id: number) =>
      fetcher<NewsResponse>(`/politicians/${id}/news`),
  },

  parties: {
    list: () => fetcher<Party[]>("/parties"),
  },

  compare: {
    get: (ids: number[]) =>
      fetcher<CompareResponse>("/compare", { ids: ids.join(",") }),
  },

  transparency: {
    amendments: (params?: {
      year?: number
      year_from?: number
      year_to?: number
      politician_id?: number
      amendment_type?: string
      function_name?: string
      is_pix?: boolean
      page?: number
      page_size?: number
    }) => fetcher<PaginatedAmendments>("/transparency/amendments", params as Record<string, string | number | undefined>),

    amendmentSummary: (params?: { year?: number; year_from?: number; year_to?: number; politician_id?: number }) =>
      fetcher<AmendmentSummary>("/transparency/amendments/summary", params as Record<string, string | number | undefined>),

    cardExpenseSummary: (params?: { organ_code?: string; year?: number }) =>
      fetcher<CardExpenseSummary>("/transparency/card-expenses/summary", params as Record<string, string | number | undefined>),

    cardExpenses: (params?: {
      organ_code?: string
      year?: number
      month?: number
      page?: number
      page_size?: number
    }) => fetcher<PaginatedCardExpenses>("/transparency/card-expenses", params as Record<string, string | number | undefined>),
  },

  stats: {
    expensesOverview: (params?: { year?: number }) =>
      fetcher<GlobalExpenseSummary>("/stats/expenses-overview", params as Record<string, string | number | undefined>),
  },
}
