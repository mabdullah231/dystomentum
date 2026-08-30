import { formatCurrency } from '../../utils/currency'

interface ExpensesMetricsProps {
  totalExpenses: number
  numberOfExpenses: number
  recordCountDelta: number
  highestExpense: number
  highestExpenseCategory: string
  avgDailySpending: number
  budgetTarget: number
  largestCategory: string
  largestCategoryShare: number
  trendPercent: number // negative if decreased
  isLightTheme: boolean
  currency: string
}

export function ExpensesMetrics({
  totalExpenses,
  numberOfExpenses,
  recordCountDelta,
  highestExpense,
  highestExpenseCategory,
  avgDailySpending,
  budgetTarget,
  largestCategory,
  largestCategoryShare,
  trendPercent,
  isLightTheme,
  currency,
}: ExpensesMetricsProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  // For expense trend, negative is good, so color accordingly
  const trendColor = trendPercent <= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {/* Total Expenses */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Total Expenses</div>
        <div className={`mt-2 font-mono text-[28px] font-bold ${headingClass}`}>
          {formatCurrency(totalExpenses, currency)}
        </div>
        <div className={`mt-1 text-xs ${trendColor}`}>
          {trendPercent >= 0 ? '+' : ''}{trendPercent.toFixed(1)}% vs last month
        </div>
      </div>

      {/* Number of Expenses */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Number of Expenses</div>
        <div className={`mt-2 font-mono text-[28px] font-bold ${headingClass}`}>
          {numberOfExpenses}
        </div>
        <div className={`mt-1 text-xs ${mutedClass}`}>
          {recordCountDelta >= 0 ? '+' : ''}{recordCountDelta} vs last month
        </div>
      </div>

      {/* Highest Expense */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Highest Expense</div>
        <div className={`mt-2 font-mono text-[28px] font-bold ${headingClass}`}>
          {formatCurrency(highestExpense, currency)}
        </div>
        <div className={`mt-1 text-xs ${mutedClass}`}>{highestExpenseCategory} Category</div>
      </div>

      {/* Avg Daily Spending */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Avg Daily Spending</div>
        <div className={`mt-2 font-mono text-[28px] font-bold ${headingClass}`}>
          {formatCurrency(avgDailySpending, currency)}
        </div>
        <div className={`mt-1 text-xs ${mutedClass}`}>Last month daily: {formatCurrency(budgetTarget, currency)}</div>
      </div>

      {/* Largest Category */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Largest Category</div>
        <div className={`mt-2 font-mono text-[28px] font-bold ${headingClass}`}>
          {largestCategory}
        </div>
        <div className={`mt-1 text-xs ${mutedClass}`}>{largestCategoryShare.toFixed(1)}% of total spend</div>
      </div>
    </div>
  )
}
