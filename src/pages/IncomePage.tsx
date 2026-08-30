import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { IncomeMetrics } from '../components/income/IncomeMetrics'
import { IncomeCategoryBreakdown } from '../components/income/IncomeCategoryBreakdown'
import { IncomeLedgerShares } from '../components/income/IncomeLedgerShares'
import { IncomeHistoricalTable } from '../components/income/IncomeHistoricalTable'

interface IncomePageProps {
  isLightTheme?: boolean
  transactionRevision?: number
}

type IncomeOverview = {
  metrics: {
    totalMonthlyIncome: number
    recordCount: number
    largestDeposit: number
    largestDepositSource: string
    averageTransaction: number
    trendPercent: number
  }
  categoryBreakdown: Array<{ label: string; amount: number; percentage: number }>
  ledgerShares: Array<{ category: string; amount: number; percentage: number }>
  entries: Array<{ id: string; date: string; description: string; subtext: string; method: string; amount: number }>
}

const emptyIncomeOverview: IncomeOverview = {
  metrics: {
    totalMonthlyIncome: 0,
    recordCount: 0,
    largestDeposit: 0,
    largestDepositSource: 'No income yet',
    averageTransaction: 0,
    trendPercent: 0,
  },
  categoryBreakdown: [],
  ledgerShares: [],
  entries: [],
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function IncomePage({ isLightTheme = false, transactionRevision = 0 }: IncomePageProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [overview, setOverview] = useState<IncomeOverview>(emptyIncomeOverview)
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('')
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const yearMonth = toYearMonth(selectedMonth)

  useEffect(() => {
    let isCurrent = true
    void window.electronAPI.invoke('get-setup-preferences').then((preferences) => {
      if (!isCurrent || !preferences || typeof preferences !== 'object') return
      const savedCurrency = (preferences as { currency?: unknown }).currency
      if (typeof savedCurrency === 'string' && savedCurrency.trim()) setCurrency(savedCurrency.trim().slice(0, 3).toUpperCase())
    }).catch(() => undefined)

    void window.electronAPI.invoke('get-income-overview', yearMonth).then((response) => {
      if (!isCurrent || !response || typeof response !== 'object') return
      setOverview(response as IncomeOverview)
      setStatus('')
    }).catch(() => {
      if (isCurrent) setStatus('Unable to load income data.')
    })

    return () => {
      isCurrent = false
    }
  }, [yearMonth, transactionRevision])

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Income Overview</h1>
          <span className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#10B981] ${
            isLightTheme
              ? 'border-[#10B981]/30 bg-[#F0FDF4]'
              : 'border-[#10B981]/30 bg-[#121215]'
          }`}>
            {getMonthLabel(selectedMonth)}
          </span>
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

      <IncomeMetrics
        totalMonthlyIncome={overview.metrics.totalMonthlyIncome}
        recordCount={overview.metrics.recordCount}
        largestDeposit={overview.metrics.largestDeposit}
        largestDepositSource={overview.metrics.largestDepositSource}
        averageTransaction={overview.metrics.averageTransaction}
        trendPercent={overview.metrics.trendPercent}
        isLightTheme={isLightTheme}
        currency={currency}
      />

      <div className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
        <IncomeCategoryBreakdown data={overview.categoryBreakdown} isLightTheme={isLightTheme} />
        <IncomeLedgerShares data={overview.ledgerShares} isLightTheme={isLightTheme} />
      </div>

      <IncomeHistoricalTable entries={overview.entries} isLightTheme={isLightTheme} currency={currency} />
    </div>
  )
}
