import { useState } from 'react'
import { MonthRangePicker } from '../components/reports/MonthRangePicker'
import { ComparisonKPICards } from '../components/reports/ComparisonKPICards'
import { ThreeMonthTrendChart } from '../components/reports/ThreeMonthTrendChart'
import { PaymentMethodDistribution } from '../components/reports/PaymentMethodDistribution'
import { PrivacyBanner } from '../components/reports/PrivacyBanner'

interface ReportsPageProps {
  isLightTheme?: boolean
}

// Sample data – will be replaced with real DB queries
const sampleKPIs = {
  income: { current: 24500, previous: 21000, changePercent: 16.6 },
  expenses: { current: 15361, previous: 16100, changePercent: -4.5 },
  savings: { current: 9138, previous: 4900, changePercent: 86.4 },
  savingsRate: { current: 37.3, previous: 23.3, changePercent: 14.0 },
}

const sampleTrend = [
  { label: 'May 2026', income: 21000, expenses: 16100 },
  { label: 'Jun 2026', income: 23000, expenses: 15800 },
  { label: 'Jul 2026', income: 24500, expenses: 15361 },
]

const samplePaymentData = [
  { method: 'Direct Debit', share: 42 },
  { method: 'Personal Card', share: 31 },
  { method: 'ACH Transfer', share: 18 },
  { method: 'Crypto Wallet', share: 9 },
]

export function ReportsPage({ isLightTheme = false }: ReportsPageProps) {
  // Default to current month and previous month
  const now = new Date()
  const defaultBase = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultCompare = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [baseMonth, setBaseMonth] = useState(defaultBase)
  const [compareMonth, setCompareMonth] = useState(defaultCompare)

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
  }

  const pageTitle = `${formatMonth(baseMonth)} vs ${formatMonth(compareMonth)} Comparison`

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      {/* Page Header */}
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

      {/* KPI Cards */}
      <ComparisonKPICards
        income={sampleKPIs.income}
        expenses={sampleKPIs.expenses}
        savings={sampleKPIs.savings}
        savingsRate={sampleKPIs.savingsRate}
        isLightTheme={isLightTheme}
      />

      {/* Chart and Distribution */}
      <div className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
        <ThreeMonthTrendChart data={sampleTrend} isLightTheme={isLightTheme} />
        <PaymentMethodDistribution data={samplePaymentData} isLightTheme={isLightTheme} />
      </div>

      {/* Privacy Banner */}
      <PrivacyBanner isLightTheme={isLightTheme} />
    </div>
  )
}