import { cn } from '../../utils/cn'

interface ExecutionBarProps {
  recordCount: number
  estimatedSize: string
  onExport: () => void
  isLightTheme: boolean
}

export function ExecutionBar({
  recordCount,
  estimatedSize,
  onExport,
  isLightTheme,
}: ExecutionBarProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const infoClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  return (
    <div className={`flex items-center justify-between rounded-[12px] border p-4 ${panelClass}`}>
      <span className={`font-mono text-sm ${infoClass}`}>
        ⓘ {recordCount} records found • ~{estimatedSize} estimated package size
      </span>
      <button
        type="button"
        onClick={onExport}
        className="rounded-xl bg-white px-6 py-2 text-sm font-bold text-black transition hover:bg-[#E4E4E7]"
      >
        Export Ledger Data
      </button>
    </div>
  )
}