import { Button } from '../ui/button'

interface TransactionsHeaderProps {
  count: number
  isLightTheme: boolean
  onNewTransaction: () => void
}

export function TransactionsHeader({ count, isLightTheme, onNewTransaction }: TransactionsHeaderProps) {
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const badgeClass = isLightTheme
    ? 'bg-[#E4E4E7] text-[#18181B]'
    : 'bg-[#1E1E24] text-[#A1A1AA]'

  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-3">
        <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Transactions</h1>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${badgeClass}`}>
          {count} records
        </span>
      </div>

      <Button
        type="button"
        className={`h-11 rounded-xl px-4 ${isLightTheme ? 'bg-white text-black hover:bg-[#E4E4E7]' : 'bg-white text-black hover:bg-[#E4E4E7]'}`}
        onClick={onNewTransaction}
      >
        <span className="text-base leading-none">+</span>
        New Transaction
      </Button>
    </header>
  )
}