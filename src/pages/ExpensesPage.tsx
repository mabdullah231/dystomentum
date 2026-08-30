import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ExpensesMetrics } from '../components/expenses/ExpensesMetrics'
import { ExpensesCategoryDistribution } from '../components/expenses/ExpensesCategoryDistribution'
import { ExpensesTable } from '../components/expenses/ExpensesTable'

interface ExpensesPageProps {
  isLightTheme?: boolean
  transactionRevision?: number
}

type ExpenseOverview = {
  metrics: {
    totalExpenses: number
    numberOfExpenses: number
    recordCountDelta: number
    highestExpense: number
    highestExpenseCategory: string
    avgDailySpending: number
    previousAvgDailySpending: number
    largestCategory: string
    largestCategoryShare: number
    trendPercent: number
  }
  categoryBreakdown: Array<{ name: string; amount: number; share: number }>
  entries: Array<{ id: string; date: string; description: string; category: string; method: string; amount: number }>
}

const emptyOverview: ExpenseOverview = {
  metrics: {
    totalExpenses: 0,
    numberOfExpenses: 0,
    recordCountDelta: 0,
    highestExpense: 0,
    highestExpenseCategory: 'No expenses yet',
    avgDailySpending: 0,
    previousAvgDailySpending: 0,
    largestCategory: 'None',
    largestCategoryShare: 0,
    trendPercent: 0,
  },
  categoryBreakdown: [],
  entries: [],
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function ExpensesPage({ isLightTheme = false, transactionRevision = 0 }: ExpensesPageProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [overview, setOverview] = useState<ExpenseOverview>(emptyOverview)
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('')
  const yearMonth = toYearMonth(selectedMonth)

  useEffect(() => {
    let isCurrent = true
    void window.electronAPI.invoke('get-setup-preferences').then((preferences) => {
      if (!isCurrent || !preferences || typeof preferences !== 'object') return
      const savedCurrency = (preferences as { currency?: unknown }).currency
      if (typeof savedCurrency === 'string' && savedCurrency.trim()) setCurrency(savedCurrency.trim().slice(0, 3).toUpperCase())
    }).catch(() => undefined)

    void window.electronAPI.invoke('get-expense-overview', yearMonth).then((response) => {
      if (!isCurrent || !response || typeof response !== 'object') return
      setOverview(response as ExpenseOverview)
      setStatus('')
    }).catch(() => {
      if (isCurrent) setStatus('Unable to load expense data.')
    })

    return () => {
      isCurrent = false
    }
  }, [yearMonth, transactionRevision])

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const methods = useMemo(
    () => ['All Methods', ...Array.from(new Set(overview.entries.map((entry) => entry.method))).sort()],
    [overview.entries],
  )

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Expense Analysis &amp; Ledger</h1>
          <p className={`mt-1 text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
            Local expense records for {getMonthLabel(selectedMonth)}.
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full border px-2 py-1.5 ${
            isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#27272A] bg-[#121215]'
          }`}
        >
          <button
            type="button"
            onClick={() => setSelectedMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7] text-[#18181B]' : 'hover:bg-[#1E1E24] text-white'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className={`min-w-[140px] text-center text-sm font-semibold ${headingClass}`}>
            {getMonthLabel(selectedMonth)}
          </div>
          <button
            type="button"
            onClick={() => setSelectedMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7] text-[#18181B]' : 'hover:bg-[#1E1E24] text-white'
            }`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {status && <p role="status" className="text-sm text-red-400">{status}</p>}

      <ExpensesMetrics
        totalExpenses={overview.metrics.totalExpenses}
        numberOfExpenses={overview.metrics.numberOfExpenses}
        recordCountDelta={overview.metrics.recordCountDelta}
        highestExpense={overview.metrics.highestExpense}
        highestExpenseCategory={overview.metrics.highestExpenseCategory}
        avgDailySpending={overview.metrics.avgDailySpending}
        budgetTarget={overview.metrics.previousAvgDailySpending}
        largestCategory={overview.metrics.largestCategory}
        largestCategoryShare={overview.metrics.largestCategoryShare}
        trendPercent={overview.metrics.trendPercent}
        isLightTheme={isLightTheme}
        currency={currency}
      />

      <ExpensesCategoryDistribution data={overview.categoryBreakdown} isLightTheme={isLightTheme} currency={currency} />
      <ExpensesTable entries={overview.entries} methods={methods} isLightTheme={isLightTheme} currency={currency} />
    </div>
  )
}
