import { useEffect, useState, useMemo } from 'react'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { SummaryMetrics } from '../components/dashboard/SummaryMetrics'
import { MonthlyChart } from '../components/dashboard/MonthlyChart'
import { ExpenseBreakdown } from '../components/dashboard/ExpenseBreakdown'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'

interface DashboardPageProps {
  isLightTheme?: boolean
}

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR'

type AccountSettings = {
  username?: string
  currency?: string
  theme?: string
}

type Transaction = {
  id: number
  date: string
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
}

type BreakdownEntry = {
  name: string
  amount: number
  share: number
}

const monthLabels = ['A', 'S', 'O', 'N', 'D', 'J', 'F', 'M', 'A', 'M', 'J', 'J']
const zeroTransactions: Transaction[] = []
const zeroBreakdown: BreakdownEntry[] = []

function normalizeCurrencyCode(input?: string): CurrencyCode {
  const value = input?.trim() ?? 'USD'
  const match = value.match(/^(USD|EUR|GBP|PKR)/i)
  return (match ? match[1].toUpperCase() : 'USD') as CurrencyCode
}

export function DashboardPage({ isLightTheme = false }: DashboardPageProps) {
  const [settings, setSettings] = useState<AccountSettings>({ username: 'Operator', currency: 'USD' })
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 7, 1))
  const [searchQuery, setSearchQuery] = useState('')

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

  const currency = normalizeCurrencyCode(settings.currency)
  const username = settings.username ?? 'Operator'

  // --- All data is currently zero/placeholder ---
  const monthlyIncome = 0
  const monthlyExpenses = 0
  const currentBalance = 0
  const savings = 0
  const savingsRate = 0

  const incomeTrend = 0
  const expenseTrend = 0
  const savingsTrend = 0
  const balanceTrend = 0

  const chartBars = useMemo(() => monthLabels.map((label, index) => ({
    label,
    income: 0,
    expense: 0,
    key: `${label}-${index}`,
  })), [])

  const expenseBreakdown: BreakdownEntry[] = zeroBreakdown
  const recentTransactions: Transaction[] = zeroTransactions
  const maxChartValue = 1

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setSelectedMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + (direction === 'prev' ? -1 : 1), 1)
    )
  }

  const handleSearch = (query: string) => setSearchQuery(query)

  // Future: navigate to Transactions page with filter
  const handleViewAll = () => {
    // window.electronAPI.navigate? or use router if implemented
    console.log('Navigate to Transactions')
  }

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      <DashboardHeader
        username={username}
        currency={currency}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onSearch={handleSearch}
        isLightTheme={isLightTheme}
      />

      <SummaryMetrics
        balance={currentBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
        savings={savings}
        savingsRate={savingsRate}
        balanceTrend={balanceTrend}
        incomeTrend={incomeTrend}
        expenseTrend={expenseTrend}
        savingsTrend={savingsTrend}
        currency={currency}
        isLightTheme={isLightTheme}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
        <MonthlyChart data={chartBars} maxValue={maxChartValue} isLightTheme={isLightTheme} />
        <ExpenseBreakdown items={expenseBreakdown} currency={currency} isLightTheme={isLightTheme} />
      </section>

      <RecentTransactions
        transactions={recentTransactions}
        currency={currency}
        isLightTheme={isLightTheme}
        onViewAll={handleViewAll}
      />
    </div>
  )
}