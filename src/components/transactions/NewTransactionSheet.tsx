import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp, Clock3, DollarSign, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '../../utils/cn' // adjust import if you have a utils file



interface NewTransactionSheetProps {
  isLightTheme: boolean
  onClose: () => void
}

function DropdownSelect({ label, value, options, isLightTheme, onValueChange, placeholder = 'Select' }) {
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
          <Select.Icon>
            <ChevronDown className="h-4 w-4 text-[#71717A]" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            side="bottom"
            align="start"
            sideOffset={6}
            avoidCollisions
            className={`dropdown-panel z-[1000] overflow-hidden rounded-xl border shadow-lg ${contentClassName}`}
          >
            <Select.ScrollUpButton className="flex items-center justify-center p-2 text-[#71717A]">
              <ChevronUp className="h-4 w-4" />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${itemClassName}`}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
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

export function NewTransactionSheet({ isLightTheme, onClose }: NewTransactionSheetProps) {
    const [transactionType, setTransactionType] = useState<'Expense' | 'Income'>('Expense')
    const [amount, setAmount] = useState('0.00')
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
    const [isClosing, setIsClosing] = useState(false)
  
    const inputClassName = isLightTheme
      ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
      : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'
  
    function handleClose(): void {
      if (isClosing) return
  
      setIsClosing(true)
      window.setTimeout(onClose, 220)
    }
  
    return (
      <div className="fixed inset-0 z-[200]">
        <button type="button" aria-label="Close new transaction sheet" className={cn('sheet-backdrop absolute inset-0 bg-black/75', isClosing && 'sheet-backdrop-closing')} onClick={handleClose} />
        <div className={cn('sheet-panel absolute inset-x-4 bottom-4 flex h-[48vh] min-h-[320px] flex-col rounded-[20px] border p-5 shadow-2xl shadow-black/50', isClosing && 'sheet-panel-closing', isLightTheme ? 'border-[#D4D4D8] bg-[#FFFFFF] text-[#18181B]' : 'border-[#27272A] bg-[#18181B] text-white')}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Add entry</p>
              <h2 className="mt-1 text-[24px] font-bold tracking-tight">New Ledger Entry</h2>
            </div>
            <button type="button" onClick={handleClose} className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${isLightTheme ? 'hover:bg-[#E4E4E7]' : 'hover:bg-[#1E1E24]'}`} aria-label="Close modal">
              <X className="h-4 w-4" />
            </button>
          </div>
  
          <div className="mt-5 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_auto] xl:items-end">
              <div>
                <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Type</label>
                <div className={`flex rounded-xl border p-1 ${isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#27272A] bg-[#121215]'}`}>
                  {(['Expense', 'Income'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTransactionType(option)}
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
  
              <div className="xl:col-span-2">
                <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Amount</label>
                <div className={`flex items-center rounded-xl border px-3 py-3 transition-colors duration-200 ${inputClassName}`}>
                  <DollarSign className="mr-2 h-4 w-4 text-[#71717A]" />
                  <input
                    type="text"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full bg-transparent font-mono text-[28px] font-semibold outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
  
              <div>
                <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Date</label>
                <div className={`flex items-center rounded-xl border px-3 py-3 transition-colors duration-200 ${inputClassName}`}>
                  <Clock3 className="mr-2 h-4 w-4 text-[#71717A]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>
  
              <DropdownSelect
                label="Category"
                value="salary"
                options={[
                  { label: 'Salary', value: 'salary' },
                  { label: 'Freelance', value: 'freelance' },
                  { label: 'Office', value: 'office' },
                  { label: 'Food', value: 'food' },
                  { label: 'Utilities', value: 'utilities' },
                ]}
                isLightTheme={isLightTheme}
                onValueChange={() => undefined}
                placeholder="Select"
              />
  
              <DropdownSelect
                label="Method"
                value="bank-transfer"
                options={[
                  { label: 'Bank Transfer', value: 'bank-transfer' },
                  { label: 'Credit Card', value: 'credit-card' },
                  { label: 'Direct Debit', value: 'direct-debit' },
                  { label: 'Cash', value: 'cash' },
                ]}
                isLightTheme={isLightTheme}
                onValueChange={() => undefined}
                placeholder="Choose"
              />
            </div>
          </div>
  
          <div className={`mt-5 flex items-center justify-between gap-3 border-t pt-4 ${isLightTheme ? 'border-[#E4E4E7]' : 'border-[#27272A]'}`}>
            <button type="button" onClick={handleClose} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-200 ${isLightTheme ? 'border-[#D4D4D8] text-[#18181B] hover:bg-[#F4F4F5]' : 'border-[#27272A] text-white hover:bg-[#1E1E24]'}`}>
              Cancel
            </button>
            <Button type="button" className="min-w-[180px] bg-white text-black transition-all duration-200 hover:bg-[#E4E4E7]">
              Add Entry
            </Button>
          </div>
        </div>
      </div>
    )
}