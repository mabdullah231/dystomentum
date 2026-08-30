interface PaymentShare {
  method: string
  share: number // percentage
}

interface PaymentMethodDistributionProps {
  data: PaymentShare[]
  isLightTheme: boolean
}

export function PaymentMethodDistribution({ data, isLightTheme }: PaymentMethodDistributionProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const trackClass = isLightTheme ? 'bg-[#E4E4E7]' : 'bg-[#121215]'
  const fillClass = isLightTheme ? 'bg-[#D4D4D8]' : 'bg-[#A1A1AA]'

  const sorted = [...data].sort((a, b) => b.share - a.share)

  return (
    <div className={`rounded-[12px] border p-5 ${panelClass}`}>
      <h2 className={`text-[16px] font-bold ${headingClass}`}>Payment Method Distribution</h2>
      <div className="mt-4 space-y-4">
        {sorted.length === 0 ? (
          <p className={`text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>No expense payments this month.</p>
        ) : (
          sorted.map((item) => (
            <div key={item.method}>
              <div className="flex items-center justify-between gap-3">
                <span className={`text-sm font-medium ${headingClass}`}>{item.method}</span>
                <span className="font-mono text-sm text-[#A1A1AA]">{item.share.toFixed(0)}%</span>
              </div>
              <div className={`mt-1 h-2 w-full overflow-hidden rounded-full ${trackClass}`}>
                <div
                  className={`h-full rounded-full ${fillClass}`}
                  style={{ width: `${Math.min(item.share, 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}