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
    ? 'border-[#D4D4D8] bg-white text-[#18181B]'
    : 'border-[#27272A] bg-[#121215] text-white'

  return (
    <div className={`rounded-xl border p-3 ${containerClass}`}>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#71717A]">Export Range</div>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selected === option.id
          return (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
                isSelected
                  ? isLightTheme
                    ? 'border-[#18181B] bg-[#F4F4F5] text-[#18181B]'
                    : 'border-white bg-[#1E1E24] text-white'
                  : isLightTheme
                    ? 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#A1A1AA] hover:bg-[#F4F4F5] hover:text-[#18181B]'
                    : 'border-[#27272A] bg-[#121215] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-white'
              )}
            >
              <input
                type="radio"
                name="export-range"
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
                className="sr-only"
              />
              <span className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full border transition-colors',
                isSelected
                  ? isLightTheme ? 'border-[#18181B]' : 'border-white'
                  : isLightTheme ? 'border-[#A1A1AA]' : 'border-[#52525B]'
              )}>
                {isSelected && <span className={cn('h-2 w-2 rounded-full', isLightTheme ? 'bg-[#18181B]' : 'bg-white')} />}
              </span>
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
