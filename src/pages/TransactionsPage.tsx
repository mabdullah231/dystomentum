import { useEffect, useMemo, useState } from 'react'
import { TransactionsHeader } from '../components/transactions/TransactionsHeader'
import { TransactionsFilters } from '../components/transactions/TransactionsFilters'
import { ActiveFilterChips } from '../components/transactions/ActiveFilterChips'
import { TransactionsTable } from '../components/transactions/TransactionsTable'
import { TransactionDetailPanel } from '../components/transactions/TransactionDetailPanel'
import { Pagination } from '../components/transactions/Pagination'
import { NewTransactionSheet, type TransactionRow as EditableTransactionRow } from '../components/transactions/NewTransactionSheet'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import {toast} from 'sonner'


interface TransactionsPageProps {
  isLightTheme?: boolean
  onOpenNewTransaction?: () => void
  transactionRevision?: number
  onLedgerChanged?: () => void
}

type TransactionType = 'INCOME' | 'EXPENSE'

type TransactionRow = {
  id: string
  date: string
  description: string
  category: string
  categoryId?: number | null
  method: string
  paymentMethodId?: number | null
  type: TransactionType
  amount: number
  notes: string
  reference: string
}

const periods = ['All Time', 'This Month', 'Last 90 Days', 'This Year']
const typeOptions = ['All Types', 'Income', 'Expense']

function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

function parseIsoDate(dateString: string): Date | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function matchesPeriodFilter(dateString: string, selectedPeriod: string): boolean {
  if (selectedPeriod === 'All Time') return true
  const date = parseIsoDate(dateString)
  if (!date) return false
  const now = new Date()

  if (selectedPeriod === 'This Month') {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  }
  if (selectedPeriod === 'Last 90 Days') {
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)
    return date >= cutoff
  }
  if (selectedPeriod === 'This Year') {
    return date.getFullYear() === now.getFullYear()
  }
  return true
}

function asCatalogNames(rows: unknown): string[] {
  if (!Array.isArray(rows)) return []
  return rows
    .map((row) => {
      const item = row as { name?: unknown }
      return typeof item.name === 'string' ? item.name : ''
    })
    .filter(Boolean)
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

export function TransactionsPage({ isLightTheme = false, onOpenNewTransaction, transactionRevision = 0, onLedgerChanged }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [catalogCategories, setCatalogCategories] = useState<string[]>([])
  const [catalogMethods, setCatalogMethods] = useState<string[]>([])
  const [currency, setCurrency] = useState('USD')
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedPeriod, setSelectedPeriod] = useState('All Time')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedMethod, setSelectedMethod] = useState('All Methods')
  const [sortNewestFirst, setSortNewestFirst] = useState(true)
  const [selectedId, setSelectedId] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<TransactionRow | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [confirmState, setConfirmState] = useState<{
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
}>({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
})

  useEffect(() => {
    let isCurrent = true

    void window.electronAPI.invoke('get-setup-preferences').then((preferences) => {
      if (!isCurrent || !preferences || typeof preferences !== 'object') return
      const savedCurrency = (preferences as { currency?: unknown }).currency
      if (typeof savedCurrency === 'string' && savedCurrency.trim()) setCurrency(savedCurrency.trim().slice(0, 3).toUpperCase())
    }).catch(() => undefined)

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)

    void Promise.all([
      window.electronAPI.invoke('get-transactions'),
      window.electronAPI.invoke('list-categories'),
      window.electronAPI.invoke('list-payment-methods'),
    ]).then(([rows, categories, methods]) => {
      if (!isCurrent) return

      const loadedTransactions = Array.isArray(rows)
        ? rows.map((row) => {
            const transaction = row as Omit<TransactionRow, 'reference'>
            return {
              ...transaction,
              method: transaction.type === 'INCOME' ? '' : transaction.method,
              reference: transaction.id,
            }
          })
        : []

      setTransactions(loadedTransactions)
      setCatalogCategories(asCatalogNames(categories))
      setCatalogMethods(asCatalogNames(methods))
      setStatus('')
    }).catch((error) => {
      if (!isCurrent) return
      setStatus(error instanceof Error ? error.message : 'Unable to load transactions.')
    }).finally(() => {
      if (isCurrent) setIsLoading(false)
    })

    return () => {
      isCurrent = false
    }
  }, [reloadKey, transactionRevision])

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()

    const matches = transactions.filter((transaction) => {
      const haystack = [transaction.description, transaction.category, transaction.method, transaction.notes, transaction.id]
        .join(' ')
        .toLowerCase()
      const matchesQuery = !query || haystack.includes(query)
      const matchesType = selectedType === 'All Types' || (selectedType === 'Income' ? transaction.type === 'INCOME' : transaction.type === 'EXPENSE')
      const matchesCategory = selectedCategory === 'All Categories' || transaction.category === selectedCategory
      const matchesMethod = selectedMethod === 'All Methods' || transaction.method === selectedMethod
      const matchesPeriod = matchesPeriodFilter(transaction.date, selectedPeriod)
      return matchesQuery && matchesType && matchesCategory && matchesMethod && matchesPeriod
    })

    return matches.sort((a, b) => {
      const byDate = a.date.localeCompare(b.date)
      const byId = a.id.localeCompare(b.id)
      const ordered = byDate !== 0 ? byDate : byId
      return sortNewestFirst ? -ordered : ordered
    })
  }, [transactions, search, selectedType, selectedCategory, selectedMethod, selectedPeriod, sortNewestFirst])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedType, selectedCategory, selectedMethod, selectedPeriod, sortNewestFirst])

  const totalItems = filteredTransactions.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, safePage, pageSize])

  const selectedTransaction = filteredTransactions.find((transaction) => transaction.id === selectedId) ?? null
  const isDetailOpen = Boolean(selectedTransaction)
  const categories = useMemo(
    () => ['All Categories', ...uniqueSorted([...catalogCategories, ...transactions.map((transaction) => transaction.category)])],
    [catalogCategories, transactions],
  )
  const methods = useMemo(
    () => ['All Methods', ...uniqueSorted([...catalogMethods, ...transactions.map((transaction) => transaction.method)])],
    [catalogMethods, transactions],
  )

  const filterConfigs = [
    { label: 'Time period', value: selectedPeriod, setter: setSelectedPeriod, options: periods },
    { label: 'Type', value: selectedType, setter: setSelectedType, options: typeOptions },
    { label: 'Category', value: selectedCategory, setter: setSelectedCategory, options: categories },
    { label: 'Payment method', value: selectedMethod, setter: setSelectedMethod, options: methods },
  ]

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

  const refreshTransactions = () => {
    setReloadKey((key) => key + 1)
  }

  // const deleteTransaction = async (id: string) => {
  //   if (!window.confirm(`Delete transaction ${id}? This cannot be undone.`)) return
  //   try {
  //     await window.electronAPI.invoke('delete-transaction', id)
  //     setSelectedId('')
  //     setStatus('')
  //     onLedgerChanged ? onLedgerChanged() : refreshTransactions()
  //   } catch (error) {
  //     setStatus(error instanceof Error ? error.message : 'Unable to delete transaction.')
  //   }
  // }

  const deleteTransaction = async (id: string) => {
  setConfirmState({
    isOpen: true,
    title: 'Delete Transaction',
    message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
    onConfirm: async () => {
      setConfirmState((prev) => ({ ...prev, isOpen: false }))
      try {
        await window.electronAPI.invoke('delete-transaction', id)
        toast.success('Transaction deleted successfully')
        setSelectedId('')
        setStatus('')
        onLedgerChanged ? onLedgerChanged() : refreshTransactions()
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unable to delete transaction.'
        toast.error('Failed to delete transaction', { description: msg })
        setStatus(msg)
      }
    },
  })
}

const closeConfirm = () => {
  setConfirmState((prev) => ({ ...prev, isOpen: false }))
}

  const cardClass = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'

  return (
    <div className="min-w-0 space-y-5">
      <TransactionsHeader
        count={filteredTransactions.length}
        isLightTheme={isLightTheme}
        onNewTransaction={onOpenNewTransaction || (() => {})}
      />

      {status && <p role="status" className="text-sm text-red-400">{status}</p>}

      <div className={`rounded-[14px] border p-4 ${cardClass}`}>
        <TransactionsFilters
          search={search}
          onSearchChange={setSearch}
          filters={filterConfigs}
          sortLabel={sortNewestFirst ? 'Newest' : 'Oldest'}
          onToggleSort={() => setSortNewestFirst((value) => !value)}
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
            onOpenDetail={(id) => setSelectedId(id)}
            isDetailOpen={isDetailOpen}
            isLightTheme={isLightTheme}
            currency={currency}
            isLoading={isLoading}
          />
          <Pagination
            currentPage={safePage}
            totalPages={totalItems === 0 ? 0 : totalPages}
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
            currency={currency}
            onClose={() => setSelectedId('')}
            onEdit={(transaction) => setEditingTransaction(transaction)}
            onDelete={(id) => void deleteTransaction(id)}
          />
        )}
      </div>
{confirmState.isOpen && (
  <ConfirmDialog
    isOpen={confirmState.isOpen}
    title={confirmState.title}
    message={confirmState.message}
    confirmLabel="Delete"
    cancelLabel="Cancel"
    onConfirm={confirmState.onConfirm}
    onCancel={closeConfirm}
    isLightTheme={isLightTheme}
    isDestructive={true}
  />
)}
      {editingTransaction && (
        <NewTransactionSheet
          isLightTheme={isLightTheme}
          transaction={editingTransaction as EditableTransactionRow}
          onClose={() => setEditingTransaction(null)}
          onSaved={() => {
            setEditingTransaction(null)
            setSelectedId('')
            onLedgerChanged ? onLedgerChanged() : refreshTransactions()
          }}
        />
      )}
    </div>
    
  )
}
