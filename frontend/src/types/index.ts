export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface Party {
  id: number
  abbreviation: string
  name: string
}

export interface PoliticianListItem {
  id: number
  name: string
  role: string
  source: string
  party: string
  uf: string
  municipality: string | null
  photo_url: string | null
}

export interface Politician extends PoliticianListItem {
  email: string | null
  phone: string | null
  legislature: number | null
  mandate_end: number | null
}

export interface PoliticianWithMetrics extends PoliticianListItem {
  legislature: number | null
  total_expenses: number
  proposition_count: number
  presence_rate: number
  total_votes: number
}

export interface Expense {
  id: number
  category: string
  description: string
  supplier_name: string
  supplier_cnpj_cpf: string | null
  value: number
  doc_url: string | null
  year: number
  month: number
}

export interface Proposition {
  id: number
  external_id: number
  prop_type: string
  number: number
  year: number
  title: string | null
  status: string | null
}

export interface Vote {
  id: number
  external_votacao_id: string
  proposition_id: number | null
  proposition_external_id: number | null
  proposition_ref: string | null
  proposition_title: string | null
  proposition_url: string | null
  direction: string
  session_date: string | null
  description: string | null
}

export interface DirectionCount {
  direction: string
  count: number
}

export interface PresenceStats {
  total: number
  presence_rate: number
  by_direction: DirectionCount[]
}

export interface ExpenseSummary {
  total: number
  by_category: { category: string; total: number }[]
  by_month: { year: number; month: number; total: number }[]
}

export interface PoliticianCompareItem {
  id: number
  name: string
  party: string | null
  uf: string | null
  photo_url: string | null
  total_expenses: number
  proposition_count: number
  presence_rate: number
  total_votes: number
}

export interface CompareResponse {
  items: PoliticianCompareItem[]
}

export interface SenatorCommittee {
  name: string
  abbreviation: string | null
  role: string | null
}

export interface SenatorMandate {
  legislature: number
  uf: string | null
  party: string | null
  start_year: number | null
  end_year: number | null
}

export interface NewsItem {
  title: string
  url: string
  source: string
  published_at: string | null
}

export interface NewsResponse {
  items: NewsItem[]
  politician_name: string
  cached: boolean
  cached_at: string | null
}

export interface SenatorDetail {
  website: string | null
  birth_date: string | null
  gender: string | null
  committees: SenatorCommittee[]
  mandates: SenatorMandate[]
}

// ─── Amendments (Emendas Parlamentares) ───────────────────────────────────────

export interface Amendment {
  id: number
  external_code: string
  year: number
  amendment_type: string | null
  author_name: string | null
  politician_id: number | null
  locality: string | null
  function_name: string | null
  subfunction_name: string | null
  committed_value: number
  liquidated_value: number
  paid_value: number
  is_pix: boolean
}

export interface PaginatedAmendments {
  items: Amendment[]
  total: number
  page: number
  page_size: number
}

export interface AmendmentTypeTotal {
  amendment_type: string | null
  committed_value: number
  paid_value: number
  count: number
  is_pix: boolean
}

export interface AmendmentFunctionTotal {
  function_name: string | null
  committed_value: number
  paid_value: number
  count: number
}

export interface AmendmentAuthorTotal {
  author_name: string | null
  politician_id: number | null
  committed_value: number
  paid_value: number
  count: number
}

export interface AmendmentSummary {
  total_committed: number
  total_paid: number
  total_count: number
  pix_committed: number
  pix_count: number
  by_type: AmendmentTypeTotal[]
  by_function: AmendmentFunctionTotal[]
  top_authors: AmendmentAuthorTotal[]
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface GlobalExpenseSummary {
  total: number
  politician_count: number
  by_month: { year: number; month: number; total: number }[]
  by_category: { category: string; total: number }[]
}

// ─── Card Expenses (Cartão Corporativo) ───────────────────────────────────────

export interface CardExpense {
  id: number
  transaction_date: string | null
  holder_name: string | null
  holder_role: string | null
  supplier_name: string | null
  supplier_cnpj: string | null
  organ_name: string
  management_unit_name: string | null
  value: number
  installments: number
}

export interface PaginatedCardExpenses {
  items: CardExpense[]
  total: number
  page: number
  page_size: number
}

export interface CardExpenseSupplierTotal {
  supplier_name: string | null
  supplier_cnpj: string | null
  total: number
  count: number
}

export interface CardExpenseMonthTotal {
  year: number
  month: number
  total: number
  count: number
}

export interface CardExpenseSummary {
  total: number
  count: number
  by_month: CardExpenseMonthTotal[]
  top_suppliers: CardExpenseSupplierTotal[]
}
