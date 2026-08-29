import { Search } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/cn'

interface IncomeEntry {
  id: string
  date: string
  description: string
  subtext?: string
  method: string
  amount: number
}

interface IncomeHistoricalTableProps {
  entries: IncomeEntry[]
  isLightTheme: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function IncomeHistoricalTable({ entries, isLightTheme }: IncomeHistoricalTableProps) {
  const [search, setSearch] = useState('')

  const filtered = entries.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    (e.subtext && e.subtext.toLowerCase().includes(search.toLowerCase()))
  )

  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'

  const headerBg = isLightTheme ? 'bg-[#F4F4F5]' : 'bg-[#121215]'

  return (
    <div className={`rounded-[12px] border p-5 ${panelClass}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={`text-[16px] font-bold ${headingClass}`}>Historical Income Entries</h2>
        <label className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${inputClass}`}>
          <Search className="h-4 w-4 text-[#71717A]" />
          <input
            className="w-[180px] border-0 bg-transparent text-sm outline-none placeholder:text-[#71717A]"
            placeholder="Search deposits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className={`${headerBg} text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]`}>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Source Description</th>
              <th className="px-3 py-3">Method</th>
              <th className="px-3 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className={`px-3 py-6 text-center text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
                  No income entries match your search.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.id} className="border-t border-[#27272A]">
                  <td className={`px-3 py-3 font-mono text-sm ${isLightTheme ? 'text-[#18181B]' : 'text-[#E4E4E7]'}`}>
                    {entry.date}
                  </td>
                  <td className="px-3 py-3">
                    <div className={`font-bold ${headingClass}`}>
                      {entry.description}
                      {entry.subtext && (
                        <span className={`ml-1 font-normal text-[#A1A1AA]`}>({entry.subtext})</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
                    {entry.method}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-sm font-bold text-[#10B981]">
                    +{formatCurrency(entry.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}