interface CategoryData {
  label: string
  amount: number
  percentage: number
}

interface IncomeCategoryBreakdownProps {
  data: CategoryData[]
  isLightTheme: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function IncomeCategoryBreakdown({ data, isLightTheme }: IncomeCategoryBreakdownProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'

  const sorted = [...data].sort((a, b) => b.amount - a.amount)
  const maxValue = sorted.length > 0 ? sorted[0].amount : 1

  return (
    <div className={`rounded-[12px] border p-5 ${panelClass}`}>
      <h2 className={`text-[16px] font-bold ${headingClass}`}>Category Breakdown</h2>
      <div className="mt-4 flex h-[200px] items-end justify-between gap-2 border-b border-[#27272A] px-1 pb-2">
        {sorted.map((item) => {
          const height = (item.amount / maxValue) * 100
          return (
            <div
              key={item.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className="w-full max-w-[40px] rounded-t-[6px] bg-[#10B981] transition-all duration-300"
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              <span
                className={`text-[9px] font-mono font-medium uppercase tracking-[0.08em] ${
                  isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
                }`}
              >
                {item.label} ({item.percentage}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}