import { Circle } from 'lucide-react'
import { cn } from '../../utils/cn'

interface SystemStatusBannerProps {
  dbPath: string
  backupTarget: string
  lastBackup: string
  nextScheduled: string
  totalSnapshots: number
  onBackupNow: () => void
  onRestore: () => void
  isLightTheme: boolean
}

export function SystemStatusBanner({
  dbPath,
  backupTarget,
  lastBackup,
  nextScheduled,
  totalSnapshots,
  onBackupNow,
  onRestore,
  isLightTheme,
}: SystemStatusBannerProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const labelClass = isLightTheme ? 'text-[#71717A]' : 'text-[#71717A]'

  return (
    <div className={`grid rounded-[12px] border p-5 xl:grid-cols-2 ${panelClass}`}>
      {/* Left Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-[#10B981] text-[#10B981]" />
          <span className={`text-sm font-bold ${headingClass}`}>
            Automatic Database Protection: Active
          </span>
        </div>

        <div>
          <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>
            Current Database Source Path
          </div>
          <div className={`mt-0.5 break-all font-mono text-sm ${headingClass}`}>{dbPath}</div>
        </div>

        <div>
          <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>
            Backup Target Directory
          </div>
          <div className={`mt-0.5 break-all font-mono text-sm ${headingClass}`}>{backupTarget}</div>
        </div>
      </div>

      {/* Right Column */}
      <div className="mt-4 flex flex-col justify-between xl:mt-0 xl:items-end">
        <div className="space-y-1 text-right">
          <div>
            <span className={`text-sm ${mutedClass}`}>Last Backed Up: </span>
            <span className={`font-mono text-sm ${headingClass}`}>{lastBackup}</span>
          </div>
          <div>
            <span className={`text-sm ${mutedClass}`}>Next Scheduled: </span>
            <span className={`font-mono text-sm ${headingClass}`}>{nextScheduled}</span>
          </div>
          <div>
            <span className={`text-sm ${mutedClass}`}>Total Local Snapshots: </span>
            <span className={`font-mono text-sm ${headingClass}`}>{totalSnapshots} Archives</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3 xl:mt-3">
          <button
            type="button"
            onClick={onBackupNow}
            className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-[#E4E4E7]"
          >
            Back Up Now
          </button>
          <button
            type="button"
            onClick={onRestore}
            className={cn(
              'rounded-xl border px-5 py-2 text-sm font-medium transition',
              isLightTheme
                ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] hover:bg-[#E4E4E7]'
                : 'border-[#27272A] bg-[#121215] text-white hover:bg-[#1E1E24]'
            )}
          >
            Restore Backup
          </button>
        </div>
      </div>
    </div>
  )
}
