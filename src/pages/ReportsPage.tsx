import { useEffect, useState } from 'react'
import { MonthRangePicker } from '../components/reports/MonthRangePicker'
import { ComparisonKPICards } from '../components/reports/ComparisonKPICards'
import { ThreeMonthTrendChart } from '../components/reports/ThreeMonthTrendChart'
import { PaymentMethodDistribution } from '../components/reports/PaymentMethodDistribution'
import { PrivacyBanner } from '../components/reports/PrivacyBanner'

interface ReportsPageProps {
  isLightTheme?: boolean
  transactionRevision?: number
}

type ComparisonMetric = { current: number; previous: number; changePercent: number }

type ReportsOverview = {
  kpis: {
    income: ComparisonMetric
    expenses: ComparisonMetric
    savings: ComparisonMetric
    savingsRate: ComparisonMetric
  }
  trend: Array<{ label: string; income: number; expenses: number }>
  paymentMethods: Array<{ method: string; share: number }>
}

const emptyOverview: ReportsOverview = {
  kpis: {
    income: { current: 0, previous: 0, changePercent: 0 },
    expenses: { current: 0, previous: 0, changePercent: 0 },
    savings: { current: 0, previous: 0, changePercent: 0 },
    savingsRate: { current: 0, previous: 0, changePercent: 0 },
  },
  trend: [],
  paymentMethods: [],
}

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function ReportsPage({ isLightTheme = false, transactionRevision = 0 }: ReportsPageProps) {
  const now = new Date()
  const [baseMonth, setBaseMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [compareMonth, setCompareMonth] = useState(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const [overview, setOverview] = useState<ReportsOverview>(emptyOverview)
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('')

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const formatMonth = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
  const pageTitle = `${formatMonth(baseMonth)} vs ${formatMonth(compareMonth)} Comparison`

  useEffect(() => {
    let isCurrent = true
    void window.electronAPI.invoke('get-setup-preferences').then((preferences) => {
      if (!isCurrent || !preferences || typeof preferences !== 'object') return
      const savedCurrency = (preferences as { currency?: unknown }).currency
      if (typeof savedCurrency === 'string' && savedCurrency.trim()) setCurrency(savedCurrency.trim().slice(0, 3).toUpperCase())
    }).catch(() => undefined)

    void window.electronAPI.invoke('get-reports-overview', {
      baseMonth: toYearMonth(baseMonth),
      compareMonth: toYearMonth(compareMonth),
    }).then((response) => {
      if (!isCurrent || !response || typeof response !== 'object') return
      setOverview(response as ReportsOverview)
      setStatus('')
    }).catch(() => {
      if (isCurrent) setStatus('Unable to load report data.')
    })

    return () => {
      isCurrent = false
    }
  }, [baseMonth, compareMonth, transactionRevision])

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>{pageTitle}</h1>
          <p className={`mt-1 text-sm ${mutedClass}`}>
            Side-by-side metric deviations and payment distributions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <MonthRangePicker
            baseMonth={baseMonth}
            compareMonth={compareMonth}
            onBaseMonthChange={setBaseMonth}
            onCompareMonthChange={setCompareMonth}
            isLightTheme={isLightTheme}
          />
          <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
            isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B]' : 'border-[#27272A] bg-[#121215] text-[#A1A1AA]'
          }`}>
            Compare Mode Enabled
          </span>
        </div>
      </header>

      {status && <p role="status" className="text-sm text-red-400">{status}</p>}

      <ComparisonKPICards
        income={overview.kpis.income}
        expenses={overview.kpis.expenses}
        savings={overview.kpis.savings}
        savingsRate={overview.kpis.savingsRate}
        isLightTheme={isLightTheme}
        currency={currency}
      />

      <div className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
        <ThreeMonthTrendChart data={overview.trend} isLightTheme={isLightTheme} />
        <PaymentMethodDistribution data={overview.paymentMethods} isLightTheme={isLightTheme} />
      </div>

      <PrivacyBanner isLightTheme={isLightTheme} />
    </div>
  )
}
