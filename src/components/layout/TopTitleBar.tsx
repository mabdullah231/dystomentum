import { Moon, Sun } from 'lucide-react'

interface TopTitleBarProps {
  title: string
  isLightTheme: boolean
  onToggleTheme: () => void
  height?: number
  controlsInset?: number
}

export function TopTitleBar({ title, isLightTheme, onToggleTheme, height = 44, controlsInset = 156 }: TopTitleBarProps) {
  return (
    <header style={{ height }} className={`fixed inset-x-0 top-0 z-10 flex items-center border-b [-webkit-app-region:drag] ${isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#1E1E22] bg-[#0A0A0C]'}`}>
      <div className="absolute left-2 flex items-center gap-2 sm:left-4">
        <img src="/branding/Icon.png" alt="" className="h-4 w-4 rounded-[3px] object-cover" aria-hidden="true" />
        <span className={`hidden text-[11px] font-bold tracking-[0.16em] sm:inline ${isLightTheme ? 'text-[#18181B]' : 'text-white'}`}>DYSTOMENTUM</span>
      </div>
      <span style={{ right: controlsInset }} className="pointer-events-none absolute left-24 top-1/2 -translate-y-1/2 truncate text-center text-[10px] font-medium tracking-wide text-[#71717A] sm:text-[11px]">{title}</span>
      <button type="button" style={{ right: controlsInset + 12 }} title={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'} aria-label={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'} onClick={onToggleTheme} className={`pointer-events-auto absolute z-20 rounded p-1 transition [-webkit-app-region:no-drag] ${isLightTheme ? 'text-[#52525B] hover:bg-[#E4E4E7]' : 'text-[#A1A1AA] hover:bg-[#1E1E24]'}`}>
        {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    </header>
  )
}
