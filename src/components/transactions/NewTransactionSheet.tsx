import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp, Clock3, DollarSign, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '../../utils/cn'
import { toast } from 'sonner'

type TransactionType = 'INCOME' | 'EXPENSE'

export interface TransactionRow {
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

interface CatalogOption {
  id: number
  name: string
}

interface NewTransactionSheetProps {
  isLightTheme: boolean
  transaction?: TransactionRow | null
  onClose: () => void
  onSaved?: () => void
}

interface DropdownSelectProps {
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  isLightTheme: boolean
  onValueChange: (value: string) => void
  placeholder?: string
}

function DropdownSelect({ label, value, options, isLightTheme, onValueChange, placeholder = 'Select' }: DropdownSelectProps) {
  const triggerClassName = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] hover:bg-[#F8F8F9]'
    : 'border-[#27272A] bg-[#121215] text-white hover:bg-[#18181B]'

  const contentClassName = isLightTheme
    ? 'border-[#D4D4D8] bg-white text-[#18181B]'
    : 'border-[#27272A] bg-[#18181B] text-white'

  const itemClassName = isLightTheme
    ? 'focus:bg-[#F4F4F5] text-[#18181B]'
    : 'focus:bg-[#1E1E24] text-white'

  return (
    <div>
      <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>{label}</label>
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger className={`flex h-[46px] w-full items-center justify-between rounded-xl border px-3 text-left text-sm outline-none transition-colors duration-200 ${triggerClassName}`}>
          <Select.Value aria-label={label} placeholder={placeholder} />
          <Select.Icon><ChevronDown className="h-4 w-4 text-[#71717A]" /></Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content position="popper" side="bottom" align="start" sideOffset={6} avoidCollisions className={`dropdown-panel z-[1000] overflow-hidden rounded-xl border shadow-lg ${contentClassName}`}>
            <Select.ScrollUpButton className="flex items-center justify-center p-2 text-[#71717A]">
              <ChevronUp className="h-4 w-4" />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${itemClassName}`}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator><Check className="h-4 w-4" /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center p-2 text-[#71717A]">
              <ChevronDown className="h-4 w-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}

function toTransactionType(value: 'Expense' | 'Income'): TransactionType {
  return value === 'Income' ? 'INCOME' : 'EXPENSE'
}

function toFormType(value?: TransactionType): 'Expense' | 'Income' {
  return value === 'INCOME' ? 'Income' : 'Expense'
}

export function NewTransactionSheet({ isLightTheme, transaction, onClose, onSaved }: NewTransactionSheetProps) {
  const [transactionType, setTransactionType] = useState<'Expense' | 'Income'>(toFormType(transaction?.type))
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().slice(0, 10))
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ? String(transaction.categoryId) : '')
  const [paymentMethodId, setPaymentMethodId] = useState(transaction?.paymentMethodId ? String(transaction.paymentMethodId) : '')
  const [notes, setNotes] = useState(transaction?.notes ?? '')
  const [categories, setCategories] = useState<CatalogOption[]>([])
  const [paymentMethods, setPaymentMethods] = useState<CatalogOption[]>([])
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const dbType = toTransactionType(transactionType)

  useEffect(() => {
    void window.electronAPI.invoke('list-categories', dbType === 'INCOME' ? 'Income' : 'Expense').then((rows) => {
      if (!Array.isArray(rows)) return
      const options = rows.map((row) => {
        const item = row as { id: number; name: string }
        return { id: item.id, name: item.name }
      })
      setCategories(options)
      if (options[0]) setCategoryId((current) => current || String(options[0].id))
    }).catch(() => setStatus('Unable to load categories.'))
  }, [dbType])

  useEffect(() => {
    void window.electronAPI.invoke('list-payment-methods').then((rows) => {
      if (!Array.isArray(rows)) return
      const options = rows.map((row) => {
        const item = row as { id: number; name: string }
        return { id: item.id, name: item.name }
      })
      setPaymentMethods(options)
      if (options[0]) setPaymentMethodId((current) => current || String(options[0].id))
    }).catch(() => setStatus('Unable to load payment methods.'))
  }, [])

  const categoryOptions = useMemo(() => categories.map((item) => ({ label: item.name, value: String(item.id) })), [categories])
  const paymentOptions = useMemo(() => paymentMethods.map((item) => ({ label: item.name, value: String(item.id) })), [paymentMethods])

  const inputClassName = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'

  function handleClose(): void {
    if (isClosing) return
    setIsClosing(true)
    window.setTimeout(onClose, 220)
  }

  async function handleSubmit(): Promise<void> {
    const parsedAmount = Number(amount)
    if (!description.trim()) {
      setStatus('Description is required.')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setStatus('Amount must be greater than zero.')
      return
    }
    if (!date) {
      setStatus('Date is required.')
      return
    }
    if (!categoryId) {
      setStatus('Category is required.')
      return
    }
    if (dbType === 'EXPENSE' && !paymentMethodId) {
      setStatus('Payment method is required.')
      return
    }

    setIsSaving(true)
    setStatus('')
    const payload = {
      type: dbType,
      date,
      description: description.trim(),
      amount: parsedAmount,
      categoryId: Number(categoryId),
      paymentMethodId: dbType === 'EXPENSE' ? Number(paymentMethodId) : null,
      notes,
    }

    // try {
    //   if (transaction) await window.electronAPI.invoke('update-transaction', transaction.id, payload)
    //   else await window.electronAPI.invoke('create-transaction', payload)
    //   onSaved?.()
    //   handleClose()
    // } catch (error) {
    //   setStatus(error instanceof Error ? error.message.replace(/^Error invoking remote method '[^']+':\s*(Error:\s*)?/, '') : 'Unable to save transaction.')
    // } finally {
    //   setIsSaving(false)
    // }
    try {
  if (transaction) {
    await window.electronAPI.invoke('update-transaction', transaction.id, payload)
    toast.success('Transaction updated successfully')
  } else {
    await window.electronAPI.invoke('create-transaction', payload)
    toast.success('Transaction added successfully')
  }
  onSaved?.()
  handleClose()
} catch (error) {
  const msg = error instanceof Error ? error.message.replace(/^Error invoking remote method '[^']+':\s*(Error:\s*)?/, '') : 'Unable to save transaction.'
  toast.error('Failed to save transaction', { description: msg })
  setStatus(msg)
} finally {
  setIsSaving(false)
}
  }

  return (
    <div className="fixed inset-0 z-[200]">
      <button type="button" aria-label="Close new transaction sheet" className={cn('sheet-backdrop absolute inset-0 bg-black/75', isClosing && 'sheet-backdrop-closing')} onClick={handleClose} />
      <div className={cn('sheet-panel absolute inset-x-4 bottom-4 flex max-h-[82vh] min-h-[420px] flex-col rounded-[20px] border p-5 shadow-2xl shadow-black/50', isClosing && 'sheet-panel-closing', isLightTheme ? 'border-[#D4D4D8] bg-[#FFFFFF] text-[#18181B]' : 'border-[#27272A] bg-[#18181B] text-white')}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>{transaction ? 'Edit entry' : 'Add entry'}</p>
            <h2 className="mt-1 text-[24px] font-bold tracking-tight">{transaction ? 'Edit Ledger Entry' : 'New Ledger Entry'}</h2>
          </div>
          <button type="button" onClick={handleClose} className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${isLightTheme ? 'hover:bg-[#E4E4E7]' : 'hover:bg-[#1E1E24]'}`} aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1.4fr_1fr_1fr_1.2fr] xl:items-end">
            <div>
              <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Type</label>
              <div className={`flex rounded-xl border p-1 ${isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#27272A] bg-[#121215]'}`}>
                {(['Expense', 'Income'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setTransactionType(option)
                      setCategoryId('')
                    }}
                    className={cn(
                      'flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                      transactionType === option
                        ? (isLightTheme ? 'bg-white text-[#18181B] shadow-sm' : 'bg-[#27272A] text-white')
                        : (isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'),
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Description</label>
              <input value={description} onChange={(event) => setDescription(event.target.value)} className={`h-[46px] w-full rounded-xl border px-3 text-sm outline-none ${inputClassName}`} placeholder="What was this for?" />
            </div>

            <div>
              <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Amount</label>
              <div className={`flex h-[46px] items-center rounded-xl border px-3 transition-colors duration-200 ${inputClassName}`}>
                <DollarSign className="mr-2 h-4 w-4 text-[#71717A]" />
                <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full bg-transparent font-mono text-sm font-semibold outline-none" placeholder="0.00" />
              </div>
            </div>

            <div>
              <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Date</label>
              <div className={`flex h-[46px] items-center rounded-xl border px-3 transition-colors duration-200 ${inputClassName}`}>
                <Clock3 className="mr-2 h-4 w-4 text-[#71717A]" />
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </div>

            <DropdownSelect label="Category" value={categoryId} options={categoryOptions} isLightTheme={isLightTheme} onValueChange={setCategoryId} placeholder="Select" />

            {dbType === 'EXPENSE' && (
              <DropdownSelect label="Method" value={paymentMethodId} options={paymentOptions} isLightTheme={isLightTheme} onValueChange={setPaymentMethodId} placeholder="Choose" />
            )}

            <div className={dbType === 'EXPENSE' ? 'xl:col-span-4' : 'xl:col-span-5'}>
              <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Notes</label>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className={`w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none ${inputClassName}`} placeholder="Optional verification notes" />
            </div>
          </div>
        </div>

        <div className={`mt-5 flex items-center justify-between gap-3 border-t pt-4 ${isLightTheme ? 'border-[#E4E4E7]' : 'border-[#27272A]'}`}>
          <p role="status" className={`text-sm ${status ? 'text-red-400' : isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>{status}</p>
          <div className="flex gap-3">
            <button type="button" onClick={handleClose} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-200 ${isLightTheme ? 'border-[#D4D4D8] text-[#18181B] hover:bg-[#F4F4F5]' : 'border-[#27272A] text-white hover:bg-[#1E1E24]'}`}>
              Cancel
            </button>
            <Button type="button" disabled={isSaving} onClick={() => void handleSubmit()} className="min-w-[180px] bg-white text-black transition-all duration-200 hover:bg-[#E4E4E7] disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? 'Saving...' : transaction ? 'Save Entry' : 'Add Entry'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
