import { useEffect, useMemo, useState } from 'react'
import { TransactionsHeader } from '../components/transactions/TransactionsHeader'
import { TransactionsFilters } from '../components/transactions/TransactionsFilters'
import { ActiveFilterChips } from '../components/transactions/ActiveFilterChips'
import { TransactionsTable } from '../components/transactions/TransactionsTable'
import { TransactionDetailPanel } from '../components/transactions/TransactionDetailPanel'
import { Pagination } from '../components/transactions/Pagination'
import { NewTransactionSheet } from '../components/transactions/NewTransactionSheet'

interface TransactionsPageProps {
  isLightTheme?: boolean
  onOpenNewTransaction?: () => void
}

type TransactionType = 'INCOME' | 'EXPENSE'

type TransactionRow = {
  id: string
  date: string
  description: string
  category: string
  method: string
  type: TransactionType
  amount: number
  notes: string
  reference: string
}

// Static filter options (will be replaced later with DB data)
const categories = ['All Categories', 'Salary', 'Freelance', 'Office', 'Food', 'Utilities', 'Marketing', 'Consulting', 'Transport', 'Software', 'Tax']
const methods = ['All Methods', 'Bank Transfer', 'Credit Card', 'Direct Debit', 'Cash']
const periods = ['All Time', 'This Month', 'Last 90 Days', 'This Year']
const typeOptions = ['All Types', 'Income', 'Expense']

function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

export function TransactionsPage({ isLightTheme = false, onOpenNewTransaction }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedPeriod, setSelectedPeriod] = useState('All Time')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedMethod, setSelectedMethod] = useState('All Methods')
  const [selectedId, setSelectedId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    let isCurrent = true

    void window.electronAPI.invoke('get-transactions').then((rows: unknown) => {
      if (!isCurrent || !Array.isArray(rows)) return

      const loadedTransactions = rows.map((row) => {
        const transaction = row as Omit<TransactionRow, 'reference'>
        return { ...transaction, reference: transaction.id }
      })

      setTransactions(loadedTransactions)
    }).catch((error) => {
      console.error('Failed to load transactions:', error)
    })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return transactions.filter((transaction) => {
      const matchesQuery = !query || transaction.description.toLowerCase().includes(query) || transaction.category.toLowerCase().includes(query)
      const matchesType = selectedType === 'All Types' || (selectedType === 'Income' ? transaction.type === 'INCOME' : transaction.type === 'EXPENSE')
      const matchesCategory = selectedCategory === 'All Categories' || transaction.category === selectedCategory
      const matchesMethod = selectedMethod === 'All Methods' || transaction.method === selectedMethod
      return matchesQuery && matchesType && matchesCategory && matchesMethod
    })
  }, [transactions, search, selectedType, selectedCategory, selectedMethod])

  // Paginate
  const totalItems = filteredTransactions.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, currentPage, pageSize])

  const selectedTransaction = filteredTransactions.find((t) => t.id === selectedId) ?? null
  const isDetailOpen = Boolean(selectedTransaction)

  // Build filter config for the Filters component
  const filterConfigs = [
    { label: 'Time period', value: selectedPeriod, setter: setSelectedPeriod, options: periods },
    { label: 'Type', value: selectedType, setter: setSelectedType, options: typeOptions },
    { label: 'Category', value: selectedCategory, setter: setSelectedCategory, options: categories },
    { label: 'Payment method', value: selectedMethod, setter: setSelectedMethod, options: methods },
  ]

  // Active filters for chips
  const activeFilters = [
    selectedPeriod !== 'All Time' && { label: 'Date', value: selectedPeriod, onRemove: () => setSelectedPeriod('All Time') },
    selectedType !== 'All Types' && { label: 'Type', value: selectedType, onRemove: () => setSelectedType('All Types') },
    selectedCategory !== 'All Categories' && { label: 'Category', value: selectedCategory, onRemove: () => setSelectedCategory('All Categories') },
    selectedMethod !== 'All Methods' && { label: 'Method', value: selectedMethod, onRemove: () => setSelectedMethod('All Methods') },
  ].filter(Boolean) as Array<{ label: string; value: string; onRemove: () => void }>

  const clearAllFilters = () => {
    setSelectedPeriod('All Time')
    setSelectedType('All Types')
    setSelectedCategory('All Categories')
    setSelectedMethod('All Methods')
    setSearch('')
  }

  const cardClass = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'

  return (
    <div className="min-w-0 space-y-5">
      <TransactionsHeader
        count={filteredTransactions.length}
        isLightTheme={isLightTheme}
        onNewTransaction={onOpenNewTransaction || (() => {})}
      />

      <div className={`rounded-[14px] border p-4 ${cardClass}`}>
        <TransactionsFilters
          search={search}
          onSearchChange={setSearch}
          filters={filterConfigs}
          onClearFilters={clearAllFilters}
          isLightTheme={isLightTheme}
        />
      </div>

      <ActiveFilterChips filters={activeFilters} isLightTheme={isLightTheme} />

      <div className={cn('grid gap-4 transition-all duration-300', isDetailOpen ? 'grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]' : 'grid-cols-1')}>
        <section className={`overflow-hidden rounded-[14px] border ${cardClass}`}>
          <TransactionsTable
            transactions={paginatedItems}
            selectedId={selectedId}
            onSelectRow={(id) => setSelectedId((current) => current === id ? '' : id)}
            isDetailOpen={isDetailOpen}
            isLightTheme={isLightTheme}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            isLightTheme={isLightTheme}
          />
        </section>

        {isDetailOpen && (
          <TransactionDetailPanel
            transaction={selectedTransaction}
            isLightTheme={isLightTheme}
            onClose={() => setSelectedId('')}
          />
        )}
      </div>

      {/* The NewTransactionSheet is not rendered here; it's managed by App.tsx (or wherever) */}
    </div>
  )
}