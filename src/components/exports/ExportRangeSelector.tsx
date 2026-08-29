import { cn } from '../../utils/cn'

export type ExportRange = 'all' | 'date-range' | 'dashboard-filters'

interface ExportRangeSelectorProps {
  selected: ExportRange
  onSelect: (range: ExportRange) => void
  isLightTheme: boolean
}

const options: Array<{ id: ExportRange; label: string }> = [
  { id: 'all', label: 'All Ledger History' },
  { id: 'date-range', label: 'Date Range' },
  { id: 'dashboard-filters', label: 'Current Dashboard Filters Only' },
]

export function ExportRangeSelector({ selected, onSelect, isLightTheme }: ExportRangeSelectorProps) {
  const containerClass = isLightTheme
    ? 'bg-[#F4F4F5] text-[#18181B]'
    : 'bg-[#121215] text-white'

  const radioClass = isLightTheme
    ? 'border-[#D4D4D8] text-[#18181B]'
    : 'border-[#27272A] text-white'

  return (
    <div className={`rounded-xl border p-3 ${containerClass}`}>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#71717A]">Export Range</div>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.id} className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="radio"
              name="export-range"
              value={option.id}
              checked={selected === option.id}
              onChange={() => onSelect(option.id)}
              className={cn(
                'h-4 w-4 accent-white',
                radioClass
              )}
            />
            <span className={isLightTheme ? 'text-[#18181B]' : 'text-white'}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}