import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

interface MonthRangePickerProps {
  baseMonth: Date
  compareMonth: Date
  onBaseMonthChange: (date: Date) => void
  onCompareMonthChange: (date: Date) => void
  isLightTheme: boolean
}

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function generateMonthOptions(): Array<{ label: string; value: string }> {
  const options = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d)
    options.push({ label, value: toYearMonth(d) })
  }
  return options
}

function dateFromValue(value: string): Date {
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

export function MonthRangePicker({
  baseMonth,
  compareMonth,
  onBaseMonthChange,
  onCompareMonthChange,
  isLightTheme,
}: MonthRangePickerProps) {
  const options = generateMonthOptions()
  const baseValue = toYearMonth(baseMonth)
  const compareValue = toYearMonth(compareMonth)

  const selectClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B]'
    : 'border-[#27272A] bg-[#121215] text-white'

  const contentClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white text-[#18181B]'
    : 'border-[#27272A] bg-[#18181B] text-white'

  const itemClass = isLightTheme
    ? 'focus:bg-[#F4F4F5]'
    : 'focus:bg-[#1E1E24]'

  const handleBaseChange = (value: string) => {
    onBaseMonthChange(dateFromValue(value))
  }

  const handleCompareChange = (value: string) => {
    onCompareMonthChange(dateFromValue(value))
  }

  return (
    <div className="flex items-center gap-2">
      <Select.Root value={baseValue} onValueChange={handleBaseChange}>
        <Select.Trigger className={`flex h-9 items-center gap-2 rounded-full border px-3 py-1 text-sm outline-none ${selectClass}`}>
          <Select.Value />
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
            className={`z-[1000] max-h-64 w-[180px] overflow-hidden rounded-xl border shadow-lg ${contentClass}`}
          >
            <Select.Viewport className="p-1">
              {options.map((opt) => (
                <Select.Item key={opt.value} value={opt.value} className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${itemClass}`}>
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <span className={`text-sm font-medium ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>vs</span>

      <Select.Root value={compareValue} onValueChange={handleCompareChange}>
        <Select.Trigger className={`flex h-9 items-center gap-2 rounded-full border px-3 py-1 text-sm outline-none ${selectClass}`}>
          <Select.Value />
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
            className={`z-[1000] max-h-64 w-[180px] overflow-hidden rounded-xl border shadow-lg ${contentClass}`}
          >
            <Select.Viewport className="p-1">
              {options.map((opt) => (
                <Select.Item key={opt.value} value={opt.value} className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${itemClass}`}>
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}