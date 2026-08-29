import { ArrowLeft, ArrowRight, Search } from 'lucide-react'

interface DashboardHeaderProps {
  username: string
  currency: string // raw currency code for display
  selectedMonth: Date
  onMonthChange: (direction: 'prev' | 'next') => void
  onSearch: (query: string) => void
  isLightTheme: boolean
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

export function DashboardHeader({
  username,
  selectedMonth,
  onMonthChange,
  onSearch,
  isLightTheme,
}: DashboardHeaderProps) {
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const secondaryClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'

  return (
    <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#71717A]">Overview</p>
        <h1 className={`mt-3 text-[32px] font-bold tracking-tight xl:text-[42px] ${headingClass}`}>
          Good evening, {username}
        </h1>
        <p className={`mt-2 text-sm ${secondaryClass}`}>
          All systems functional. Vault database is synchronized.
        </p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div
          className={`flex items-center gap-2 rounded-full border px-2 py-1.5 ${
            isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#27272A] bg-[#121215]'
          }`}
        >
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => onMonthChange('prev')}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7] text-[#18181B]' : 'hover:bg-[#1E1E24] text-white'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className={`min-w-[170px] text-center text-sm font-semibold ${headingClass}`}>
            {getMonthLabel(selectedMonth)}
          </div>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => onMonthChange('next')}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7] text-[#18181B]' : 'hover:bg-[#1E1E24] text-white'
            }`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <label className={`flex items-center gap-2 rounded-full border px-3 py-2.5 ${inputClass}`}>
          <Search className="h-4 w-4 text-[#71717A]" />
          <input
            className="w-[220px] border-0 bg-transparent text-sm outline-none placeholder:text-[#71717A]"
            placeholder="Search ledger..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>
      </div>
    </header>
  )
}