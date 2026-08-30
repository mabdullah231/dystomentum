import { formatCurrency } from '../../utils/currency'

interface ComparisonKPICardsProps {
  income: { current: number; previous: number; changePercent: number }
  expenses: { current: number; previous: number; changePercent: number }
  savings: { current: number; previous: number; changePercent: number }
  savingsRate: { current: number; previous: number; changePercent: number }
  isLightTheme: boolean
  currency: string
}

export function ComparisonKPICards({
  income,
  expenses,
  savings,
  savingsRate,
  isLightTheme,
  currency,
}: ComparisonKPICardsProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  const getTrendColor = (value: number, isExpense: boolean = false) => {
    // For expenses, negative change is good (green); for income/savings, positive is good.
    const isPositive = isExpense ? value <= 0 : value >= 0
    return isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Income */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Income Comparison</div>
        <div className={`mt-2 flex items-baseline gap-2`}>
          <span className={`font-mono text-[28px] font-bold ${headingClass}`}>{formatCurrency(income.current, currency, 0)}</span>
          <span className={`text-sm ${mutedClass}`}>vs {formatCurrency(income.previous, currency, 0)}</span>
        </div>
        <div className={`mt-1 text-xs ${getTrendColor(income.changePercent)}`}>
          {income.changePercent >= 0 ? '+' : ''}{income.changePercent.toFixed(1)}% from prev. cycle
        </div>
      </div>

      {/* Expenses */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Expense Comparison</div>
        <div className={`mt-2 flex items-baseline gap-2`}>
          <span className={`font-mono text-[28px] font-bold ${headingClass}`}>{formatCurrency(expenses.current, currency, 0)}</span>
          <span className={`text-sm ${mutedClass}`}>vs {formatCurrency(expenses.previous, currency, 0)}</span>
        </div>
        <div className={`mt-1 text-xs ${getTrendColor(expenses.changePercent, true)}`}>
          {expenses.changePercent >= 0 ? '+' : ''}{expenses.changePercent.toFixed(1)}% from prev. cycle
        </div>
      </div>

      {/* Savings */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Savings Accumulated</div>
        <div className={`mt-2 flex items-baseline gap-2`}>
          <span className={`font-mono text-[28px] font-bold ${headingClass}`}>{formatCurrency(savings.current, currency, 0)}</span>
          <span className={`text-sm ${mutedClass}`}>vs {formatCurrency(savings.previous, currency, 0)}</span>
        </div>
        <div className={`mt-1 text-xs ${getTrendColor(savings.changePercent)}`}>
          {savings.changePercent >= 0 ? '+' : ''}{savings.changePercent.toFixed(1)}% from prev. cycle
        </div>
      </div>

      {/* Savings Rate */}
      <div className={`rounded-[12px] border p-4 ${panelClass}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">Savings Rate Delta</div>
        <div className={`mt-2 flex items-baseline gap-2`}>
          <span className={`font-mono text-[28px] font-bold ${headingClass}`}>{savingsRate.current.toFixed(1)}%</span>
          <span className={`text-sm ${mutedClass}`}>vs {savingsRate.previous.toFixed(1)}%</span>
        </div>
        <div className={`mt-1 text-xs ${getTrendColor(savingsRate.changePercent)}`}>
          {savingsRate.changePercent >= 0 ? '+' : ''}{savingsRate.changePercent.toFixed(1)}% from prev. cycle
        </div>
      </div>
    </div>
  )
}
