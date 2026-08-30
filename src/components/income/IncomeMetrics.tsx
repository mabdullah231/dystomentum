import { formatCurrency } from '../../utils/currency'

interface IncomeMetricsProps {
  totalMonthlyIncome: number
  recordCount: number
  largestDeposit: number
  largestDepositSource: string
  averageTransaction: number
  trendPercent: number
  isLightTheme: boolean
  currency: string
}

export function IncomeMetrics({
  totalMonthlyIncome,
  recordCount,
  largestDeposit,
  largestDepositSource,
  averageTransaction,
  trendPercent,
  isLightTheme,
  currency,
}: IncomeMetricsProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  const trendColor = trendPercent >= 0 ? 'text-[#10B981]' : 'text-[#F87171]'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Monthly Income */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Total Monthly Income</div>
        <div className={`mt-2 font-mono text-[28px] font-bold text-[#10B981] ${headingClass}`}>
          {formatCurrency(totalMonthlyIncome, currency)}
        </div>
        <div className={`mt-1 text-xs ${trendColor}`}>
          {trendPercent >= 0 ? '+' : ''}{trendPercent.toFixed(1)}% vs last month
        </div>
      </div>

      {/* Income Records */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Income Records</div>
        <div className={`mt-2 font-mono text-[28px] font-bold ${headingClass}`}>
          {recordCount} Entries
        </div>
        <div className={`mt-1 text-xs ${mutedClass}`}>Active in July ledger</div>
      </div>

      {/* Largest Deposit */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Largest Deposit</div>
        <div className={`mt-2 font-mono text-[28px] font-bold ${headingClass}`}>
          {formatCurrency(largestDeposit, currency)}
        </div>
        <div className={`mt-1 text-xs ${mutedClass}`}>Source: {largestDepositSource}</div>
      </div>

      {/* Average Transaction */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Average Transaction</div>
        <div className={`mt-2 font-mono text-[28px] font-bold ${headingClass}`}>
          {formatCurrency(averageTransaction, currency)}
        </div>
        <div className={`mt-1 text-xs ${mutedClass}`}>Median deposit valuation</div>
      </div>
    </div>
  )
}
