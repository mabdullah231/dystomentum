import * as Select from '@radix-ui/react-select'
import {
  Briefcase, Car, Check, ChevronDown, Coffee, CreditCard, Film, Home, Landmark, ShoppingBag, Smartphone, TrendingUp, Tv, Utensils, Wallet, X, Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { CategoryItem } from './CategoryCard'
import { toast } from 'sonner'


export interface CategoryFormData {
  id?: string
  name: string
  iconName?: string
  color?: string
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CategoryFormData) => void
  editingItem?: CategoryItem | null
  type: 'income' | 'expense' | 'payment'
  isLightTheme: boolean
}

type IconOption = { name: string; label: string; Icon: LucideIcon }

const iconOptions: IconOption[] = [
  { name: 'briefcase', label: 'Briefcase', Icon: Briefcase }, { name: 'wallet', label: 'Wallet', Icon: Wallet },
  { name: 'landmark', label: 'Bank', Icon: Landmark }, { name: 'credit-card', label: 'Card', Icon: CreditCard },
  { name: 'home', label: 'Home', Icon: Home }, { name: 'shopping', label: 'Shopping', Icon: ShoppingBag },
  { name: 'utensils', label: 'Food', Icon: Utensils }, { name: 'car', label: 'Transport', Icon: Car },
  { name: 'zap', label: 'Utilities', Icon: Zap }, { name: 'coffee', label: 'Coffee', Icon: Coffee },
  { name: 'film', label: 'Entertainment', Icon: Film }, { name: 'tv', label: 'Television', Icon: Tv },
  { name: 'trending-up', label: 'Investment', Icon: TrendingUp }, { name: 'smartphone', label: 'Phone', Icon: Smartphone },
]

const defaultIconByType: Record<CategoryModalProps['type'], string> = {
  income: 'briefcase', expense: 'shopping', payment: 'credit-card',
}

export function CategoryModal({ isOpen, onClose, onSave, editingItem, type, isLightTheme }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [iconName, setIconName] = useState(defaultIconByType[type])

  useEffect(() => {
    setName(editingItem?.name ?? '')
    setIconName(editingItem?.iconName ?? defaultIconByType[type])
  }, [editingItem, isOpen, type])

  if (!isOpen) return null

  const panelClass = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'
  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'
  const selectContentClass = isLightTheme ? 'border-[#D4D4D8] bg-white text-[#18181B]' : 'border-[#27272A] bg-[#18181B] text-white'
  const selectedIcon = iconOptions.find((option) => option.name === iconName) ?? iconOptions[0]
  const SelectedIcon = selectedIcon.Icon
  const title = editingItem ? `Edit ${type === 'payment' ? 'Payment Method' : 'Category'}` : `Add ${type === 'payment' ? 'Payment Method' : 'Category'}`

  // const handleSubmit = (event: React.FormEvent) => {
  //   event.preventDefault()
  //   onSave({ id: editingItem?.id, name, iconName, color: editingItem?.color })
  //   onClose()
  // }

  const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault()
  
  if (!name.trim()) {
    toast.error('Name is required', { description: 'Please enter a name for this item.' })
    return
  }

  try {
    await onSave({ id: editingItem?.id, name, iconName, color: editingItem?.color })
    toast.success(
      editingItem 
        ? `${type === 'payment' ? 'Payment method' : 'Category'} updated` 
        : `${type === 'payment' ? 'Payment method' : 'Category'} created`
    )
    onClose()
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to save.'
    toast.error('Save failed', { description: msg })
  }
}

  return (
    <div className="fixed inset-0 z-[300] flex pointer-events-none items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="category-modal-title" className={`category-modal-enter pointer-events-auto w-full max-w-md rounded-[14px] border p-6 shadow-xl ${panelClass}`}>
        <div className="flex items-center justify-between">
          <h2 id="category-modal-title" className={`text-xl font-bold ${isLightTheme ? 'text-[#18181B]' : 'text-white'}`}>{title}</h2>
          <button type="button" onClick={onClose} className={`rounded p-1 transition ${isLightTheme ? 'hover:bg-[#E4E4E7]' : 'hover:bg-[#1E1E24]'}`} aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Name</label>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputClass}`} placeholder="Enter name..." required />
          </div>

          <div>
            <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'}`}>Icon</label>
            <Select.Root value={iconName} onValueChange={setIconName}>
              <Select.Trigger className={`flex h-[46px] w-full items-center justify-between rounded-xl border px-3 text-left text-sm outline-none transition-colors ${inputClass}`}>
                <span className="flex items-center gap-2"><SelectedIcon className="h-4 w-4" /><Select.Value /></span>
                <Select.Icon><ChevronDown className="h-4 w-4 text-[#71717A]" /></Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content position="popper" side="bottom" align="start" sideOffset={6} className={`dropdown-panel z-[1000] max-h-[280px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}>
                  <Select.Viewport className="grid grid-cols-2 gap-1 p-1">
                    {iconOptions.map(({ name: optionName, label, Icon }) => (
                      <Select.Item key={optionName} value={optionName} className={`relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none ${isLightTheme ? 'focus:bg-[#F4F4F5]' : 'focus:bg-[#1E1E24]'}`}>
                        <Icon className="h-4 w-4" />
                        <Select.ItemText>{label}</Select.ItemText>
                        <Select.ItemIndicator className="ml-auto"><Check className="h-4 w-4" /></Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={`rounded-xl border px-4 py-2 text-sm font-medium ${isLightTheme ? 'border-[#D4D4D8] text-[#18181B] hover:bg-[#F4F4F5]' : 'border-[#27272A] text-white hover:bg-[#1E1E24]'}`}>Cancel</button>
            <button type="submit" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-[#E4E4E7]">{editingItem ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
