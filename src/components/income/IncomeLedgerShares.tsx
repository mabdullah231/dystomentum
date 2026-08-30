interface ShareData {
  category: string
  percentage: number
  amount: number
}

interface IncomeLedgerSharesProps {
  data: ShareData[]
  isLightTheme: boolean
}

export function IncomeLedgerShares({ data, isLightTheme }: IncomeLedgerSharesProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const trackClass = isLightTheme ? 'bg-[#E4E4E7]' : 'bg-[#121215]'

  const sorted = [...data].sort((a, b) => b.percentage - a.percentage)

  return (
    <div className={`rounded-[12px] border p-5 ${panelClass}`}>
      <h2 className={`text-[16px] font-bold ${headingClass}`}>Ledger Shares</h2>
      <div className="mt-4 space-y-4">
        {sorted.map((item) => (
          <div key={item.category}>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-sm font-medium ${headingClass}`}>{item.category}</span>
              <span className="font-mono text-sm text-[#A1A1AA]">{item.percentage.toFixed(1)}%</span>
            </div>
            <div className={`mt-1 h-2 w-full overflow-hidden rounded-full ${trackClass}`}>
              <div
                className="h-full rounded-full bg-[#10B981] transition-all duration-300"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
