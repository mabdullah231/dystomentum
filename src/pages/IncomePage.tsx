import { IncomeMetrics } from '../components/income/IncomeMetrics'
import { IncomeCategoryBreakdown } from '../components/income/IncomeCategoryBreakdown'
import { IncomeLedgerShares } from '../components/income/IncomeLedgerShares'
import { IncomeHistoricalTable } from '../components/income/IncomeHistoricalTable'

interface IncomePageProps {
  isLightTheme?: boolean
}

// Sample data – will be replaced with real data from the database
const sampleMetrics = {
  totalMonthlyIncome: 8250.00,
  recordCount: 14,
  largestDeposit: 3400.00,
  largestDepositSource: 'Corporate Contract',
  averageTransaction: 589.28,
  trendPercent: 4.1,
}

const sampleCategoryData = [
  { label: 'Contracts', amount: 5362.50, percentage: 65 },
  { label: 'Dividends', amount: 1237.50, percentage: 15 },
  { label: 'Interests', amount: 990.00, percentage: 12 },
  { label: 'Other', amount: 660.00, percentage: 8 },
]

const sampleShares = [
  { category: 'Contracts', percentage: 65.0, amount: 5362.50 },
  { category: 'Dividends', percentage: 15.0, amount: 1237.50 },
  { category: 'Interests', percentage: 12.0, amount: 990.00 },
  { category: 'Other', percentage: 8.0, amount: 660.00 },
]

const sampleEntries = [
  { id: '1', date: '2026-07-15', description: 'Corporate Payout', subtext: 'Principal B7 Node', method: 'Wire Transfer', amount: 3400.00 },
  { id: '2', date: '2026-07-10', description: 'Dividend Distribution', subtext: 'Q2 2026', method: 'ACH Direct', amount: 1237.50 },
  { id: '3', date: '2026-07-05', description: 'Interest Accrual', subtext: 'Savings Bond', method: 'Direct Deposit', amount: 990.00 },
  { id: '4', date: '2026-07-01', description: 'Freelance Consulting', subtext: 'Project Delta', method: 'Crypto Wallet', amount: 850.00 },
  { id: '5', date: '2026-06-28', description: 'Royalty Payment', subtext: 'Licensing', method: 'Wire Transfer', amount: 600.00 },
]

export function IncomePage({ isLightTheme = false }: IncomePageProps) {
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      {/* Page Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Income Overview</h1>
          <span className={`inline-flex mt-2 items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#10B981] ${
  isLightTheme
    ? 'border-[#10B981]/30 bg-[#F0FDF4]'
    : 'border-[#10B981]/30 bg-[#121215]'
}`}>
  Synced Vault
</span>
        </div>

      </header>

      {/* Metrics */}
      <IncomeMetrics
        totalMonthlyIncome={sampleMetrics.totalMonthlyIncome}
        recordCount={sampleMetrics.recordCount}
        largestDeposit={sampleMetrics.largestDeposit}
        largestDepositSource={sampleMetrics.largestDepositSource}
        averageTransaction={sampleMetrics.averageTransaction}
        trendPercent={sampleMetrics.trendPercent}
        isLightTheme={isLightTheme}
      />

      {/* Two-column: Category Breakdown + Ledger Shares */}
      <div className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
        <IncomeCategoryBreakdown data={sampleCategoryData} isLightTheme={isLightTheme} />
        <IncomeLedgerShares data={sampleShares} isLightTheme={isLightTheme} />
      </div>

      {/* Historical Income Entries */}
      <IncomeHistoricalTable entries={sampleEntries} isLightTheme={isLightTheme} />
    </div>
  )
}