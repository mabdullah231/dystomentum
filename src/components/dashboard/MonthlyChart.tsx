import { Panel } from '../ui/Card'

interface ChartBar {
  label: string
  income: number
  expense: number
}

interface MonthlyChartProps {
  data: ChartBar[]
  maxValue: number // used for scaling heights
  isLightTheme: boolean
}

export function MonthlyChart({ data, maxValue, isLightTheme }: MonthlyChartProps) {
  const panelClass = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'

  return (
    <Panel className={`rounded-[12px] border p-5 ${panelClass}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`text-[18px] font-bold ${headingClass}`}>Monthly Income vs Expenses</h2>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.12em] text-[#71717A]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#2563EB]" />Income
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#71717A]" />Expenses
          </span>
        </div>
      </div>

      <div className="mt-6 flex h-[260px] items-end gap-3 border-b border-[#27272A] px-3 pb-4 pt-4">
        {data.map((bar, index) => {
          const incomeHeight = maxValue > 0 ? (bar.income / maxValue) * 100 : 0
          const expenseHeight = maxValue > 0 ? (bar.expense / maxValue) * 100 : 0

          return (
            <div key={`${bar.label}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-3">
              <div className="flex h-[190px] w-full items-end justify-center gap-1">
                <span
                  className="w-[18px] rounded-t-[8px] bg-[#2563EB]"
                  style={{ height: `${incomeHeight}%` }}
                />
                <span
                  className="w-[18px] rounded-t-[8px] bg-[#71717A]"
                  style={{ height: `${expenseHeight}%` }}
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]">
                {bar.label}
              </span>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}