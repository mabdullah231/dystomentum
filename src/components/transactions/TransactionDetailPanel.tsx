import { Pencil, Trash2, X } from 'lucide-react'

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

interface TransactionDetailPanelProps {
  transaction: TransactionRow | null
  isLightTheme: boolean
  onClose: () => void
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

export function TransactionDetailPanel({ transaction, isLightTheme, onClose }: TransactionDetailPanelProps) {
  if (!transaction) return null

  const isIncome = transaction.type === 'INCOME'
  const tone = isIncome ? 'bg-[#0D3B2E] text-[#6EE7B7] border-[#1F8F6D]' : 'bg-[#2A1A1D] text-[#F4C2C2] border-[#7C2D2D]'

  return (
    <aside className={`detail-panel flex h-full min-h-[640px] flex-col overflow-hidden rounded-[14px] border ${isLightTheme ? 'border-[#D4D4D8] bg-[#FFFFFF]' : 'border-[#27272A] bg-[#18181B]'}`}>
      <div className={`flex items-center justify-between border-b px-4 py-3 ${isLightTheme ? 'border-[#E4E4E7] bg-[#F8F8F9]' : 'border-[#27272A] bg-[#141417]'}`}>
        <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>Transaction Audit</span>
        <button type="button" onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-full ${isLightTheme ? 'text-[#18181B] hover:bg-[#E4E4E7]' : 'text-[#F4F4F5] hover:bg-[#27272A]'}`} aria-label="Close detail panel">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className={`rounded-[12px] border p-4 ${isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#27272A] bg-[#0F0F12]'}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tone}`}>
              {isIncome ? 'Income Record' : 'Expense Record'}
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>ID: {transaction.id}</span>
          </div>

          <div className="mt-5 font-mono text-[28px] font-bold tracking-tight" style={{ color: isIncome ? '#10B981' : isLightTheme ? '#18181B' : '#F4F4F5' }}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>

          <div className={`mt-4 rounded-[10px] border px-3 py-2 text-[11px] ${isLightTheme ? 'border-[#D4D4D8] bg-[#FFFFFF] text-[#52525B]' : 'border-[#27272A] bg-[#121215] text-[#A1A1AA]'}`}>
            Reference: <span className="font-mono text-[#F4F4F5]">{transaction.reference}</span>
          </div>
        </div>

        <div className={`rounded-[12px] border p-4 ${isLightTheme ? 'border-[#D4D4D8] bg-[#F8F8F9]' : 'border-[#27272A] bg-[#101014]'}`}>
          <div className="space-y-4">
            <div>
              <div className={`text-[9px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Description</div>
              <div className={`mt-1 text-base font-semibold ${isLightTheme ? 'text-[#18181B]' : 'text-white'}`}>{transaction.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={`text-[9px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Date</div>
                <div className={`mt-1 text-sm ${isLightTheme ? 'text-[#18181B]' : 'text-[#F4F4F5]'}`}>{formatDate(transaction.date)}</div>
              </div>
              <div>
                <div className={`text-[9px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Value</div>
                <div className={`mt-1 font-mono text-sm ${isIncome ? 'text-[#10B981]' : isLightTheme ? 'text-[#18181B]' : 'text-[#F4F4F5]'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={`text-[9px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Category</div>
                <div className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs ${isLightTheme ? 'border-[#D4D4D8] bg-white text-[#18181B]' : 'border-[#27272A] bg-[#18181B] text-[#F4F4F5]'}`}>
                  {transaction.category}
                </div>
              </div>
              <div>
                <div className={`text-[9px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Method</div>
                <div className={`mt-1 text-sm ${isLightTheme ? 'text-[#18181B]' : 'text-[#F4F4F5]'}`}>{transaction.method}</div>
              </div>
            </div>

            <div>
              <div className={`text-[9px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Verification Notes</div>
              <div className={`mt-2 rounded-[10px] border p-3 font-mono text-[11px] leading-6 ${isLightTheme ? 'border-[#D4D4D8] bg-white text-[#18181B]' : 'border-[#27272A] bg-[#121215] text-[#E4E4E7]'}`}>
                {transaction.notes}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-auto flex gap-3 border-t p-4 ${isLightTheme ? 'border-[#E4E4E7] bg-[#F8F8F9]' : 'border-[#27272A] bg-[#141417]'}`}>
        <button type="button" className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold ${isLightTheme ? 'border-[#D4D4D8] bg-[#FFFFFF] text-[#18181B] hover:bg-[#F4F4F5]' : 'border-[#3F3F46] bg-[#1E1E22] text-white hover:bg-[#2A2A2F]'}`}>
          <Pencil className="h-4 w-4" />
          Edit Entry
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#7F1D1D] bg-[#2A1A1D] px-4 py-2.5 text-sm font-semibold text-[#FCA5A5] hover:bg-[#3B1F23]">
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </aside>
  )
}