import { cn } from '../../utils/cn'

interface AboutClientTabProps {
  isLightTheme: boolean
}

export function AboutClientTab({ isLightTheme }: AboutClientTabProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const iconBg = isLightTheme ? 'bg-[#F4F4F5]' : 'bg-[#121215]'

  return (
    <div className={`rounded-[12px] border p-6 ${panelClass}`}>
      {/* Brand Header */}
      <div className="flex items-start gap-4">
        <div
          className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <span className="text-2xl font-bold">D</span>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${headingClass}`}>Dystomentum Personal Ledger</h2>
          <div className={`mt-1 font-mono text-sm ${mutedClass}`}>
            Version 1.0.0 (Production Release — build_2026_07_28)
          </div>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="mt-6 space-y-2 border-t border-[#27272A] pt-4">
        <ul className={`space-y-2 text-sm ${headingClass}`}>
          <li className="flex items-start gap-2">
            <span className="text-[#A1A1AA]">•</span>
            <span>Offline-first architecture. Your finance ledger database never leaves this hardware workspace.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#A1A1AA]">•</span>
            <span>No telemetry server setups. Zero analytical cloud tracking scripts included.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}