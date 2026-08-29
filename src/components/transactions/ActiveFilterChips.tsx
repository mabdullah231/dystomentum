import { X } from 'lucide-react'

interface ActiveFilter {
  label: string
  value: string
  onRemove: () => void
}

interface ActiveFilterChipsProps {
  filters: ActiveFilter[]
  isLightTheme: boolean
}

export function ActiveFilterChips({ filters, isLightTheme }: ActiveFilterChipsProps) {
  if (filters.length === 0) return null

  const chipClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B]'
    : 'border-[#27272A] bg-[#121215] text-[#E4E4E7]'

  return (
    <div className="flex flex-wrap items-center gap-3 px-1">
      <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>
        Active Filters:
      </span>
      {filters.map((filter) => (
        <button
          key={filter.label}
          type="button"
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] font-medium ${chipClass}`}
          onClick={filter.onRemove}
        >
          {filter.label}: {filter.value} <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  )
}