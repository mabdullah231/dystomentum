import { Search } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '../../utils/currency'

interface ExpenseEntry {
  id: string
  date: string
  description: string
  category: string
  method: string
  amount: number
}

interface ExpensesTableProps {
  entries: ExpenseEntry[]
  methods?: string[]
  isLightTheme: boolean
  currency: string
}

const sortOptions = ['Newest', 'Oldest', 'Amount (High to Low)', 'Amount (Low to High)']

export function ExpensesTable({ entries, methods, isLightTheme, currency }: ExpensesTableProps) {
  const [search, setSearch] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('All Methods')
  const [sortBy, setSortBy] = useState('Newest')
  const methodOptions = methods && methods.length > 0 ? methods : ['All Methods']

  const filtered = entries.filter((e) => {
    const query = search.toLowerCase()
    const matchesSearch = e.description.toLowerCase().includes(query) || e.category.toLowerCase().includes(query)
    const matchesMethod = selectedMethod === 'All Methods' || e.method === selectedMethod
    return matchesSearch && matchesMethod
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'Newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'Oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'Amount (High to Low)':
        return b.amount - a.amount
      case 'Amount (Low to High)':
        return a.amount - b.amount
      default:
        return 0
    }
  })

  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'

  const headerBg = isLightTheme ? 'bg-[#F4F4F5]' : 'bg-[#121215]'
  const selectContentClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white text-[#18181B]'
    : 'border-[#27272A] bg-[#18181B] text-white'

  return (
    <div className={`rounded-[12px] border p-5 ${panelClass}`}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${inputClass}`}>
          <Search className="h-4 w-4 text-[#71717A]" />
          <input
            className="w-[220px] border-0 bg-transparent text-sm outline-none placeholder:text-[#71717A]"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-3">
          {/* Payment Method Filter */}
          <Select.Root value={selectedMethod} onValueChange={setSelectedMethod}>
            <Select.Trigger
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm outline-none ${inputClass}`}
            >
              <span>Payment: </span>
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-4 w-4 text-[#71717A]" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                side="bottom"
                align="start"
                sideOffset={6}
                avoidCollisions
                className={`dropdown-panel z-[1000] w-[180px] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}
              >
                <Select.Viewport className="p-1">
                  {methodOptions.map((option) => (
                    <Select.Item
                      key={option}
                      value={option}
                      className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${
                        isLightTheme ? 'focus:bg-[#F4F4F5]' : 'focus:bg-[#1E1E24]'
                      }`}
                    >
                      <Select.ItemText>{option}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          {/* Sort Control */}
          <Select.Root value={sortBy} onValueChange={setSortBy}>
            <Select.Trigger
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm outline-none ${inputClass}`}
            >
              <span>Sort: </span>
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-4 w-4 text-[#71717A]" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                side="bottom"
                align="start"
                sideOffset={6}
                avoidCollisions
                className={`dropdown-panel z-[1000] w-[200px] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}
              >
                <Select.Viewport className="p-1">
                  {sortOptions.map((option) => (
                    <Select.Item
                      key={option}
                      value={option}
                      className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${
                        isLightTheme ? 'focus:bg-[#F4F4F5]' : 'focus:bg-[#1E1E24]'
                      }`}
                    >
                      <Select.ItemText>{option}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className={`${headerBg} text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]`}>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Description</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Payment Method</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-3 py-6 text-center text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
                  No expense entries match your filters.
                </td>
              </tr>
            ) : (
              sorted.map((entry) => (
                <tr key={entry.id} className="border-t border-[#27272A]">
                  <td className={`px-3 py-3 font-mono text-sm ${isLightTheme ? 'text-[#18181B]' : 'text-[#E4E4E7]'}`}>
                    {entry.date}
                  </td>
                  <td className={`px-3 py-3 font-bold ${headingClass}`}>{entry.description}</td>
                  <td className={`px-3 py-3 text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
                    {entry.category}
                  </td>
                  <td className={`px-3 py-3 text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
                    {entry.method}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${
                        isLightTheme
                          ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B]'
                          : 'border-[#27272A] bg-[#121215] text-[#A1A1AA]'
                      }`}
                    >
                      Expense
                    </span>
                  </td>
                  <td className={`px-3 py-3 text-right font-mono text-sm font-bold ${isLightTheme ? 'text-[#991B1B]' : 'text-[#F87171]'}`}>
                    -{formatCurrency(entry.amount, currency)}
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
