import { formatCurrency } from '../../utils/currency'

interface CategoryItem {
  name: string
  amount: number
  share: number
}

interface ExpensesCategoryDistributionProps {
  data: CategoryItem[]
  isLightTheme: boolean
  currency: string
}

export function ExpensesCategoryDistribution({ data, isLightTheme, currency }: ExpensesCategoryDistributionProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const trackClass = isLightTheme ? 'bg-[#E4E4E7]' : 'bg-[#121215]'
  const fillClass = isLightTheme ? 'bg-[#D4D4D8]' : 'bg-[#A1A1AA]'

  // Sort by share descending
  const sorted = [...data].sort((a, b) => b.share - a.share)

  return (
    <div className={`rounded-[12px] border p-5 ${panelClass}`}>
      <h2 className={`text-[16px] font-bold ${headingClass}`}>Expense Category Distribution</h2>
      {sorted.length === 0 ? (
        <p className={`mt-5 text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>No expense categories this month.</p>
      ) : (
      <div className="mt-5 space-y-4">
        {sorted.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-sm font-medium ${headingClass}`}>{item.name}</span>
              <span className="font-mono text-sm">
                <span className={headingClass}>{formatCurrency(item.amount, currency)}</span>
                <span className={`ml-2 text-xs ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
                  {item.share.toFixed(1)}%
                </span>
              </span>
            </div>
            <div className={`mt-1 h-2 w-full overflow-hidden rounded-full ${trackClass}`}>
              <div
                className={`h-full rounded-full ${fillClass}`}
                style={{ width: `${Math.min(item.share, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
