import { ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { Panel } from '../ui/Card'

interface MetricCardProps {
  label: string
  value: string
  trend: number
  icon: React.ReactNode
  trendLabel?: string // if not provided, use "vs last month"
  isLightTheme: boolean
  isPositiveTrend?: boolean // if not provided, determined by trend >= 0
}

function MetricCard({ label, value, trend, icon, trendLabel, isLightTheme, isPositiveTrend }: MetricCardProps) {
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const panelClass = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'
  const trendColor = (isPositiveTrend ?? trend >= 0)
    ? (isLightTheme ? 'text-[#166534]' : 'text-[#4ADE80]')
    : (isLightTheme ? 'text-[#991B1B]' : 'text-[#F87171]')

  return (
    <Panel className={`rounded-[12px] border p-4 ${panelClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#71717A]">{label}</span>
        {icon}
      </div>
      <p className={`mt-5 font-mono text-[22px] font-bold ${headingClass}`}>{value}</p>
      <p className={`mt-2 text-xs ${trendColor}`}>
        {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% {trendLabel ?? 'vs last month'}
      </p>
    </Panel>
  )
}

interface SummaryMetricsProps {
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
  savings: number
  savingsRate: number
  balanceTrend: number
  incomeTrend: number
  expenseTrend: number
  savingsTrend: number
  currency: string
  isLightTheme: boolean
}

export function SummaryMetrics({
  balance,
  monthlyIncome,
  monthlyExpenses,
  savings,
  savingsRate,
  balanceTrend,
  incomeTrend,
  expenseTrend,
  savingsTrend,
  currency,
  isLightTheme,
}: SummaryMetricsProps) {
  const format = (value: number) => {
    // Simple formatting, we assume the parent passes already formatted strings?
    // To keep it self-contained, we format here using Intl.
    const localeMap: Record<string, string> = { USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', PKR: 'en-PK' }
    const currencyMap: Record<string, string> = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', PKR: 'PKR' }
    const locale = localeMap[currency] ?? 'en-US'
    const curr = currencyMap[currency] ?? 'USD'
    return new Intl.NumberFormat(locale, { style: 'currency', currency: curr, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5" aria-label="Financial summary metrics">
      <MetricCard
        label="Current balance"
        value={format(balance)}
        trend={balanceTrend}
        icon={<TrendingUp className="h-4 w-4 text-[#71717A]" />}
        isLightTheme={isLightTheme}
      />
      <MetricCard
        label="Monthly income"
        value={format(monthlyIncome)}
        trend={incomeTrend}
        icon={<ArrowDownLeft className="h-4 w-4 text-[#71717A]" />}
        isLightTheme={isLightTheme}
      />
      <MetricCard
        label="Monthly expenses"
        value={format(monthlyExpenses)}
        trend={expenseTrend}
        icon={<ArrowUpRight className="h-4 w-4 text-[#71717A]" />}
        isLightTheme={isLightTheme}
        isPositiveTrend={expenseTrend <= 0} // decrease is good
      />
      <MetricCard
        label="Savings"
        value={format(savings)}
        trend={savingsTrend}
        icon={<TrendingUp className="h-4 w-4 text-[#71717A]" />}
        isLightTheme={isLightTheme}
      />
      <MetricCard
        label="Savings rate"
        value={`${savingsRate.toFixed(1)}%`}
        trend={savingsTrend}
        icon={<TrendingDown className="h-4 w-4 text-[#71717A]" />}
        isLightTheme={isLightTheme}
        trendLabel="vs last month"
      />
    </section>
  )
}