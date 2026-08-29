import { Shield } from 'lucide-react'
import { cn } from '../../utils/cn'

interface PrivacyBannerProps {
  isLightTheme: boolean
}

export function PrivacyBanner({ isLightTheme }: PrivacyBannerProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const textClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  return (
    <div className={`flex items-center gap-4 rounded-[12px] border p-4 ${panelClass}`}>
      <Shield className={`h-6 w-6 ${isLightTheme ? 'text-[#18181B]' : 'text-[#A1A1AA]'}`} />
      <span className={`font-mono text-sm ${textClass}`}>
        Comparative database compiled purely from zero-knowledge local key logs. No external servers queried.
      </span>
    </div>
  )
}