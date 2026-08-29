import { cn } from '../../utils/cn'

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'sqlite'

interface ExportFormatSelectorProps {
  selected: ExportFormat
  onSelect: (format: ExportFormat) => void
  isLightTheme: boolean
}

const formats: Array<{
  id: ExportFormat
  label: string
  subtext: string
}> = [
  { id: 'csv', label: 'Comma Separated (CSV)', subtext: 'Standard compatibility for spreadsheets' },
  { id: 'xlsx', label: 'Microsoft Excel (.xlsx)', subtext: 'Preserves worksheet tables and formulas' },
  { id: 'json', label: 'JSON Ledger', subtext: 'Rich nested data structure for custom tools' },
  { id: 'sqlite', label: 'SQLite Database', subtext: 'Direct backup of full schema database' },
]

export function ExportFormatSelector({ selected, onSelect, isLightTheme }: ExportFormatSelectorProps) {
  const cardBase = isLightTheme
    ? 'border-[#D4D4D8] bg-white text-[#18181B]'
    : 'border-[#27272A] bg-[#18181B] text-white'

  const cardSelected = isLightTheme
    ? 'border-[#18181B] ring-2 ring-[#18181B]'
    : 'border-white ring-2 ring-white'

  return (
    <div className="grid grid-cols-4 gap-3">
      {formats.map((format) => {
        const isSelected = selected === format.id
        return (
          <button
            key={format.id}
            type="button"
            onClick={() => onSelect(format.id)}
            className={cn(
              'flex flex-col items-start rounded-lg border p-3 text-left transition-all',
              cardBase,
              isSelected && cardSelected,
              !isSelected && isLightTheme
                ? 'hover:border-[#18181B]'
                : 'hover:border-[#A1A1AA]'
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-bold">{format.label}</span>
              <span
                className={cn(
                  'inline-block h-3 w-3 rounded-full border-2',
                  isSelected
                    ? isLightTheme
                      ? 'border-[#18181B] bg-[#18181B]'
                      : 'border-white bg-white'
                    : isLightTheme
                      ? 'border-[#D4D4D8]'
                      : 'border-[#27272A]'
                )}
              />
            </div>
            <span className={`mt-1 text-xs ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
              {format.subtext}
            </span>
          </button>
        )
      })}
    </div>
  )
}