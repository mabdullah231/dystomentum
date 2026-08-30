import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, Search } from 'lucide-react'

interface FilterConfig {
  label: string
  value: string
  setter: (value: string) => void
  options: string[]
}

interface TransactionsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filters: FilterConfig[]
  sortLabel: string
  onToggleSort: () => void
  onClearFilters: () => void
  isLightTheme: boolean
}

export function TransactionsFilters({
  search,
  onSearchChange,
  filters,
  sortLabel,
  onToggleSort,
  onClearFilters,
  isLightTheme,
}: TransactionsFiltersProps) {
  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'

  const selectContentClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white text-[#18181B]'
    : 'border-[#27272A] bg-[#18181B] text-white'

  const selectItemClass = isLightTheme
    ? 'focus:bg-[#F4F4F5]'
    : 'focus:bg-[#1E1E24]'

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
      <label className={`flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 ${inputClass}`}>
        <Search className="h-4 w-4 text-[#71717A]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#71717A]"
          placeholder="Search description, category, notes, or ID..."
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Select.Root key={filter.label} value={filter.value} onValueChange={filter.setter}>
            <Select.Trigger className={`flex w-[180px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm outline-none ${inputClass}`}>
              <Select.Value aria-label={filter.label} />
              <Select.Icon>
                <ChevronDown className="h-4 w-4 text-[#71717A]" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                side="bottom"
                align="start"
                sideOffset={6}
                avoidCollisions
                className={`dropdown-panel z-[1000] w-[180px] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}
              >
                <Select.Viewport className="p-1">
                  {filter.options.map((option) => (
                    <Select.Item key={option} value={option} className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${selectItemClass}`}>
                      <Select.ItemText>{option}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSort}
          className={`text-sm font-medium ${isLightTheme ? 'text-[#18181B]' : 'text-[#F4F4F5]'}`}
        >
          Sort: {sortLabel}
        </button>
        <button
          type="button"
          className={`text-sm font-medium ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}
          onClick={onClearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}