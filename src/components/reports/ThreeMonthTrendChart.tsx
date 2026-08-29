interface MonthData {
  label: string
  income: number
  expenses: number
}

interface ThreeMonthTrendChartProps {
  data: MonthData[]
  isLightTheme: boolean
}

export function ThreeMonthTrendChart({ data, isLightTheme }: ThreeMonthTrendChartProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.income, d.expenses]),
    1
  )

  return (
    <div className={`rounded-[12px] border p-5 ${panelClass}`}>
      <h2 className={`text-[16px] font-bold ${headingClass}`}>3-Month Trend Overview</h2>
      <div className="mt-4 flex h-[220px] items-end justify-around gap-4 border-b border-[#27272A] px-2 pb-2">
        {data.map((month) => {
          const incomeHeight = (month.income / maxValue) * 100
          const expenseHeight = (month.expenses / maxValue) * 100
          return (
            <div
              key={month.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="flex w-full max-w-[60px] flex-1 items-end justify-center gap-1.5">
                <div
                  className="w-[18px] rounded-t-[6px] bg-white"
                  style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                />
                <div
                  className="w-[18px] rounded-t-[6px] bg-[#A1A1AA]"
                  style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                />
              </div>
              <span className={`text-[10px] font-mono uppercase ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
                {month.label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex justify-center gap-6 text-xs text-[#71717A]">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-white" /> Income
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#A1A1AA]" /> Expenses
        </span>
      </div>
    </div>
  )
}