import { Moon, Sun } from 'lucide-react'

interface TopTitleBarProps {
  title: string
  isLightTheme: boolean
  onToggleTheme: () => void
}

export function TopTitleBar({ title, isLightTheme, onToggleTheme }: TopTitleBarProps) {
  return (
    <header className={`fixed inset-x-0 top-0 z-30 flex h-9 items-center border-b [-webkit-app-region:drag] ${isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#1E1E22] bg-[#0A0A0C]'}`}>
      <div className="absolute left-2 flex items-center gap-2 sm:left-4">
        <img src="/branding/Icon.png" alt="" className="h-4 w-4 rounded-[3px] object-cover" aria-hidden="true" />
        <span className={`hidden text-[11px] font-bold tracking-[0.16em] sm:inline ${isLightTheme ? 'text-[#18181B]' : 'text-white'}`}>DYSTOMENTUM</span>
      </div>
      <span className="mx-auto max-w-[45%] truncate text-[10px] font-medium tracking-wide text-[#71717A] sm:max-w-none sm:text-[11px]">{title}</span>
      <button type="button" title={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'} aria-label={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'} onClick={onToggleTheme} className={`pointer-events-auto absolute right-20 z-40 rounded p-1 transition [-webkit-app-region:no-drag] ${isLightTheme ? 'text-[#52525B] hover:bg-[#E4E4E7]' : 'text-[#A1A1AA] hover:bg-[#1E1E24]'}`}>
        {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    </header>
  )
}
