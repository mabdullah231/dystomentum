import { useEffect, useMemo, useState } from 'react'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { SummaryMetrics } from '../components/dashboard/SummaryMetrics'
import { MonthlyChart } from '../components/dashboard/MonthlyChart'
import { ExpenseBreakdown } from '../components/dashboard/ExpenseBreakdown'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'

interface DashboardPageProps {
  isLightTheme?: boolean
  transactionRevision?: number
  onViewAllTransactions?: () => void
}

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR'

type AccountSettings = {
  username?: string
  currency?: string
  theme?: string
}

type Transaction = {
  id: string
  date: string
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
}

type DashboardOverview = {
  metrics: {
    monthlyIncome: number
    monthlyExpenses: number
    savings: number
    savingsRate: number
    incomeTrend: number
    expenseTrend: number
    savingsTrend: number
    balanceTrend: number
  }
  chart: Array<{ label: string; income: number; expense: number }>
  expenseBreakdown: Array<{ name: string; amount: number; share: number }>
  recentTransactions: Transaction[]
}

const emptyOverview: DashboardOverview = {
  metrics: {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
    savingsRate: 0,
    incomeTrend: 0,
    expenseTrend: 0,
    savingsTrend: 0,
    balanceTrend: 0,
  },
  chart: [],
  expenseBreakdown: [],
  recentTransactions: [],
}

function normalizeCurrencyCode(input?: string): CurrencyCode {
  const value = input?.trim() ?? 'USD'
  const match = value.match(/^(USD|EUR|GBP|PKR)/i)
  return (match ? match[1].toUpperCase() : 'USD') as CurrencyCode
}

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function DashboardPage({ isLightTheme = false, transactionRevision = 0, onViewAllTransactions }: DashboardPageProps) {
  const [settings, setSettings] = useState<AccountSettings>({ username: 'Operator', currency: 'USD' })
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [searchQuery, setSearchQuery] = useState('')
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview)
  const yearMonth = toYearMonth(selectedMonth)

  useEffect(() => {
    void window.electronAPI.invoke('get-setup-preferences').then((preferences) => {
      if (preferences && typeof preferences === 'object') {
        const saved = preferences as AccountSettings
        setSettings({
          username: saved.username ?? 'Operator',
          currency: saved.currency ?? 'USD',
          theme: saved.theme ?? 'Dark',
        })
      }
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    let isCurrent = true
    void window.electronAPI.invoke('get-dashboard-overview', yearMonth).then((response) => {
      if (!isCurrent || !response || typeof response !== 'object') return
      setOverview(response as DashboardOverview)
    }).catch(() => undefined)

    return () => {
      isCurrent = false
    }
  }, [yearMonth, transactionRevision])

  const currency = normalizeCurrencyCode(settings.currency)
  const username = settings.username ?? 'Operator'
  const query = searchQuery.trim().toLowerCase()
  const recentTransactions = overview.recentTransactions.filter((transaction) => {
    if (!query) return true
    return [transaction.description, transaction.category, transaction.id].join(' ').toLowerCase().includes(query)
  })
  const maxChartValue = Math.max(1, ...overview.chart.flatMap((bar) => [bar.income, bar.expense]))
  const chartBars = useMemo(
    () => overview.chart.map((bar, index) => ({ ...bar, key: `${bar.label}-${index}` })),
    [overview.chart],
  )

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      <DashboardHeader
        username={username}
        currency={currency}
        selectedMonth={selectedMonth}
        onMonthChange={(direction) => {
          setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + (direction === 'prev' ? -1 : 1), 1))
        }}
        onSearch={setSearchQuery}
        isLightTheme={isLightTheme}
      />

      <SummaryMetrics
        balance={overview.metrics.savings}
        monthlyIncome={overview.metrics.monthlyIncome}
        monthlyExpenses={overview.metrics.monthlyExpenses}
        savings={overview.metrics.savings}
        savingsRate={overview.metrics.savingsRate}
        balanceTrend={overview.metrics.balanceTrend}
        incomeTrend={overview.metrics.incomeTrend}
        expenseTrend={overview.metrics.expenseTrend}
        savingsTrend={overview.metrics.savingsTrend}
        currency={currency}
        isLightTheme={isLightTheme}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
        <MonthlyChart data={chartBars} maxValue={maxChartValue} isLightTheme={isLightTheme} />
        <ExpenseBreakdown items={overview.expenseBreakdown} currency={currency} isLightTheme={isLightTheme} />
      </section>

      <RecentTransactions
        transactions={recentTransactions}
        currency={currency}
        isLightTheme={isLightTheme}
        onViewAll={onViewAllTransactions}
      />
    </div>
  )
}
