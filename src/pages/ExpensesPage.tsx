import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ExpensesMetrics } from '../components/expenses/ExpensesMetrics'
import { ExpensesCategoryDistribution } from '../components/expenses/ExpensesCategoryDistribution'
import { ExpensesTable } from '../components/expenses/ExpensesTable'
import { cn } from '../utils/cn'

interface ExpensesPageProps {
  isLightTheme?: boolean
}

// Sample data – will be replaced with real data from the database
const sampleMetrics = {
  totalExpenses: 15361.95,
  numberOfExpenses: 205,
  highestExpense: 1200.00,
  highestExpenseCategory: 'Equipment',
  avgDailySpending: 495.55,
  budgetTarget: 500.00,
  largestCategory: 'Housing',
  largestCategoryShare: 36.1,
  trendPercent: -4.2,
}

const sampleCategories = [
  { name: 'Housing', amount: 1850.00, share: 36.1 },
  { name: 'Food & Dining', amount: 1200.00, share: 23.4 },
  { name: 'Transportation', amount: 820.50, share: 16.0 },
  { name: 'Utilities', amount: 610.00, share: 11.9 },
  { name: 'Entertainment', amount: 380.00, share: 7.4 },
]

const sampleEntries = [
  { id: '1', date: '2026-07-15', description: 'Local Power Grid', category: 'Utilities', method: 'Direct Debit', amount: 142.50 },
  { id: '2', date: '2026-07-14', description: 'Industrial Supplies Ltd', category: 'Equipment', method: 'ACH Transfer', amount: 1200.00 },
  { id: '3', date: '2026-07-13', description: 'Rent Payment', category: 'Housing', method: 'Personal Card', amount: 1850.00 },
  { id: '4', date: '2026-07-12', description: 'Weekly Groceries', category: 'Food & Dining', method: 'Personal Card', amount: 320.00 },
  { id: '5', date: '2026-07-11', description: 'Gas Station', category: 'Transportation', method: 'Crypto Wallet', amount: 45.00 },
  { id: '6', date: '2026-07-10', description: 'Streaming Services', category: 'Entertainment', method: 'Direct Debit', amount: 15.99 },
]

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

export function ExpensesPage({ isLightTheme = false }: ExpensesPageProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 6, 1)) // July 2026

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const handlePrevMonth = () => {
    setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  const handleNextMonth = () => {
    setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      {/* Page Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Expense Analysis &amp; Ledger</h1>
          <p className={`mt-1 text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
            Showing local accounting database for Q3 2026.
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full border px-2 py-1.5 ${
            isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#27272A] bg-[#121215]'
          }`}
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7] text-[#18181B]' : 'hover:bg-[#1E1E24] text-white'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className={`min-w-[140px] text-center text-sm font-semibold ${headingClass}`}>
            {getMonthLabel(selectedMonth)}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7] text-[#18181B]' : 'hover:bg-[#1E1E24] text-white'
            }`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <ExpensesMetrics
        totalExpenses={sampleMetrics.totalExpenses}
        numberOfExpenses={sampleMetrics.numberOfExpenses}
        highestExpense={sampleMetrics.highestExpense}
        highestExpenseCategory={sampleMetrics.highestExpenseCategory}
        avgDailySpending={sampleMetrics.avgDailySpending}
        budgetTarget={sampleMetrics.budgetTarget}
        largestCategory={sampleMetrics.largestCategory}
        largestCategoryShare={sampleMetrics.largestCategoryShare}
        trendPercent={sampleMetrics.trendPercent}
        isLightTheme={isLightTheme}
      />

      {/* Category Distribution */}
      <ExpensesCategoryDistribution data={sampleCategories} isLightTheme={isLightTheme} />

      {/* Table */}
      <ExpensesTable entries={sampleEntries} isLightTheme={isLightTheme} />
    </div>
  )
}