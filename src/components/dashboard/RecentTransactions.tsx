
interface Transaction {
  id: number
  date: string
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  currency: string
  isLightTheme: boolean
  onViewAll?: () => void
}

export function RecentTransactions({ transactions, currency, isLightTheme, onViewAll }: RecentTransactionsProps) {
  const panelClass = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const secondaryClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const tableHeaderClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#E4E4E7] text-[#18181B]'
    : 'border-[#27272A] bg-[#121215] text-[#71717A]'

  const formatCurrency = (value: number) => {
    const localeMap: Record<string, string> = { USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', PKR: 'en-PK' }
    const currencyMap: Record<string, string> = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', PKR: 'PKR' }
    const locale = localeMap[currency] ?? 'en-US'
    const curr = currencyMap[currency] ?? 'USD'
    return new Intl.NumberFormat(locale, { style: 'currency', currency: curr, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }

  return (
    <section className={`rounded-[12px] border p-5 ${panelClass}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className={`text-[18px] font-bold ${headingClass}`}>Recent Ledger Transactions</h2>
        {onViewAll && (
          <button
            type="button"
            className={`text-sm font-medium underline-offset-4 hover:underline ${secondaryClass}`}
            onClick={onViewAll}
          >
            View All
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#27272A]">
        <div
          className={`grid grid-cols-[15%_35%_20%_15%_15%] border-b px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] ${tableHeaderClass}`}
        >
          <span>Date</span>
          <span>Description</span>
          <span>Category</span>
          <span>Type</span>
          <span className="text-right">Amount</span>
        </div>

        {transactions.length === 0 ? (
          <div
            className={`px-4 py-8 text-center text-sm ${
              isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
            }`}
          >
            No ledger activity yet.
          </div>
        ) : (
          transactions.map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-[15%_35%_20%_15%_15%] items-center px-4 py-3 text-sm ${
                isLightTheme ? 'border-b border-[#E4E4E7] bg-white' : 'border-b border-[#27272A] bg-[#18181B]'
              }`}
            >
              <span className={secondaryClass}>{item.date}</span>
              <div>
                <p className={`font-bold ${headingClass}`}>{item.description}</p>
              </div>
              <span className={secondaryClass}>{item.category}</span>
              <span
                className={`inline-flex w-fit items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  item.type === 'INCOME' ? 'bg-[#1F2937] text-[#E5E7EB]' : 'bg-[#27272A] text-[#F4F4F5]'
                }`}
              >
                {item.type}
              </span>
              <span
                className={`font-mono text-right font-semibold ${
                  item.type === 'INCOME' ? 'text-[#4ADE80]' : 'text-[#F87171]'
                }`}
              >
                {item.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}