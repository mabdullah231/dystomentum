import { Panel } from '../ui/Card'

interface BreakdownItem {
  name: string
  amount: number
  share: number // percentage
}

interface ExpenseBreakdownProps {
  items: BreakdownItem[]
  currency: string
  isLightTheme: boolean
}

export function ExpenseBreakdown({ items, currency, isLightTheme }: ExpenseBreakdownProps) {
  const panelClass = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const secondaryClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const mutedClass = 'text-[#71717A]'

  const formatCurrency = (value: number) => {
    const localeMap: Record<string, string> = { USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', PKR: 'en-PK' }
    const currencyMap: Record<string, string> = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', PKR: 'PKR' }
    const locale = localeMap[currency] ?? 'en-US'
    const curr = currencyMap[currency] ?? 'USD'
    return new Intl.NumberFormat(locale, { style: 'currency', currency: curr, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }

  return (
    <Panel className={`rounded-[12px] border p-5 ${panelClass}`}>
      <h2 className={`text-[18px] font-bold ${headingClass}`}>Expense Breakdown</h2>
      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div
            className={`rounded-lg border border-dashed px-4 py-6 text-center text-sm ${
              isLightTheme ? 'border-[#D4D4D8] text-[#52525B]' : 'border-[#27272A] text-[#A1A1AA]'
            }`}
          >
            No expense data yet
          </div>
        ) : (
          items.map((item) => (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className={`text-sm font-medium ${headingClass}`}>{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm ${secondaryClass}`}>
                    {formatCurrency(item.amount)}
                  </span>
                  <span className={`text-xs ${mutedClass}`}>{item.share}%</span>
                </div>
              </div>
              <div
                className={`h-2.5 overflow-hidden rounded-full ${
                  isLightTheme ? 'bg-[#E4E4E7]' : 'bg-[#1E1E24]'
                }`}
              >
                <div className="h-full rounded-full bg-[#71717A]" style={{ width: `${item.share}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  )
}