import { Check, Ellipsis } from 'lucide-react'

interface TransactionRow {
  id: string
  date: string
  description: string
  category: string
  method: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  notes: string
  reference: string
}

interface TransactionsTableProps {
  transactions: TransactionRow[]
  selectedId: string
  onSelectRow: (id: string) => void
  isDetailOpen: boolean // whether detail panel is shown (squeezes columns)
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

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function TransactionsTable({
  transactions,
  selectedId,
  onSelectRow,
  isDetailOpen,
  isLightTheme,
}: TransactionsTableProps) {
  const rowBgSelected = isLightTheme ? 'bg-[#E4E4E7]' : 'bg-[#1E1E24]'
  const rowBgHover = isLightTheme ? 'hover:bg-[#F4F4F5]' : 'hover:bg-[#1A1A1E]'

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className={isLightTheme ? 'bg-[#F4F4F5] text-[#18181B]' : 'bg-[#121215] text-[#A1A1AA]'}>
            <th className="w-12 px-3 py-3 text-center">
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded border ${isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'}`}>
                <Check className="h-3 w-3" />
              </span>
            </th>
            <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">Date</th>
            <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">Description</th>
            <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">Category</th>
            {!isDetailOpen && <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">Method</th>}
            <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">Type</th>
            <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-[0.14em]">Amount</th>
            <th className="w-12 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.14em]">⋮</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={isDetailOpen ? 7 : 8} className={`px-4 py-8 text-center text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
                No ledger activity yet.
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => {
              const isSelected = selectedId === transaction.id
              const isIncome = transaction.type === 'INCOME'

              return (
                <tr
                  key={transaction.id}
                  onClick={() => onSelectRow(transaction.id)}
                  className={`cursor-pointer transition-all duration-200 ease-out ${isSelected ? rowBgSelected : rowBgHover}`}
                >
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded border ${isSelected ? (isLightTheme ? 'border-[#18181B] bg-[#18181B] text-white' : 'border-white bg-white text-[#18181B]') : (isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#121215]')}`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                  </td>
                  <td className={`px-3 py-3 text-sm ${isLightTheme ? 'text-[#18181B]' : 'text-[#F4F4F5]'}`}>{formatDate(transaction.date)}</td>
                  <td className={`px-3 py-3 text-sm ${isLightTheme ? 'text-[#18181B]' : 'text-[#F4F4F5]'}`}>{transaction.description}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium ${isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B]' : 'border-[#27272A] bg-[#121215] text-[#E4E4E7]'}`}>
                      {transaction.category}
                    </span>
                  </td>
                  {!isDetailOpen && <td className={`px-3 py-3 text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>{transaction.method}</td>}
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${isIncome ? (isLightTheme ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#063B2F] text-[#6EE7B7]') : (isLightTheme ? 'bg-[#F4F4F5] text-[#18181B]' : 'bg-[#27272A] text-[#F4F4F5]')}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className={`px-3 py-3 text-right font-mono text-sm font-semibold ${isIncome ? 'text-[#10B981]' : isLightTheme ? 'text-[#18181B]' : 'text-[#F4F4F5]'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button type="button" className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${isLightTheme ? 'hover:bg-[#E4E4E7] text-[#18181B]' : 'hover:bg-[#27272A] text-[#F4F4F5]'}`} aria-label={`Open menu for ${transaction.id}`}>
                      <Ellipsis className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}