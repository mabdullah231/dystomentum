import { cn } from '../../utils/cn'

export type BackupStatus = 'SUCCESS' | 'FAILED'

interface StatusBadgeProps {
  status: BackupStatus
  isLightTheme: boolean
}

export function StatusBadge({ status, isLightTheme }: StatusBadgeProps) {
  const baseClass = 'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border'

  if (status === 'SUCCESS') {
    return (
      <span
        className={cn(
          baseClass,
          isLightTheme
            ? 'border-[#10B981]/30 bg-[#DCFCE7] text-[#166534]'
            : 'border-[#10B981] bg-[#064E3B] text-[#10B981]'
        )}
      >
        Success
      </span>
    )
  }

  return (
    <span
      className={cn(
        baseClass,
        isLightTheme
          ? 'border-[#EF4444]/30 bg-[#FEE2E2] text-[#991B1B]'
          : 'border-[#EF4444] bg-[#7F1D1D] text-[#EF4444]'
      )}
    >
      Failed
    </span>
  )
}