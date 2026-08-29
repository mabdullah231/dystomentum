import { cn } from '../../utils/cn'

interface TransactionTypeCheckboxesProps {
  includeIncome: boolean
  includeExpense: boolean
  includeTransfers: boolean
  onToggleIncome: () => void
  onToggleExpense: () => void
  onToggleTransfers: () => void
  isLightTheme: boolean
}

export function TransactionTypeCheckboxes({
  includeIncome,
  includeExpense,
  includeTransfers,
  onToggleIncome,
  onToggleExpense,
  onToggleTransfers,
  isLightTheme,
}: TransactionTypeCheckboxesProps) {
  const containerClass = isLightTheme
    ? 'bg-[#F4F4F5] text-[#18181B]'
    : 'bg-[#121215] text-white'

  const checkboxClass = isLightTheme
    ? 'border-[#D4D4D8] accent-[#18181B]'
    : 'border-[#27272A] accent-white'

  return (
    <div className={`rounded-xl border p-3 ${containerClass}`}>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#71717A]">Transaction Types</div>
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={includeIncome}
            onChange={onToggleIncome}
            className={cn('h-4 w-4 rounded', checkboxClass)}
          />
          <span className={isLightTheme ? 'text-[#18181B]' : 'text-white'}>Income Ledger Entries</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={includeExpense}
            onChange={onToggleExpense}
            className={cn('h-4 w-4 rounded', checkboxClass)}
          />
          <span className={isLightTheme ? 'text-[#18181B]' : 'text-white'}>Expense Ledger Entries</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={includeTransfers}
            onChange={onToggleTransfers}
            className={cn('h-4 w-4 rounded', checkboxClass)}
          />
          <span className={isLightTheme ? 'text-[#18181B]' : 'text-white'}>Internal Wallet Transfers</span>
        </label>
      </div>
    </div>
  )
}