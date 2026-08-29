import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { CategoryItem } from './CategoryCard'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<CategoryItem, 'id' | 'transactionCount' | 'isDefault'> & { id?: string }) => void
  editingItem?: CategoryItem | null
  type: 'income' | 'expense' | 'payment'
  isLightTheme: boolean
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  type,
  isLightTheme,
}: CategoryModalProps) {
  const [name, setName] = useState('')
  const [iconName, setIconName] = useState('')

  // When editing, populate fields
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name)
      // In a real implementation, we'd store icon name separately
    } else {
      setName('')
      setIconName('')
    }
  }, [editingItem, isOpen])

  if (!isOpen) return null

  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: editingItem?.id,
      name,
      // In a real app, we'd include icon/color
    })
    onClose()
  }

  const title = editingItem ? `Edit ${type === 'payment' ? 'Payment Method' : 'Category'}` : `Add ${type === 'payment' ? 'Payment Method' : 'Category'}`

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70">
      <div
        className={`w-full max-w-md rounded-[14px] border p-6 shadow-xl ${panelClass}`}
      >
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${isLightTheme ? 'text-[#18181B]' : 'text-white'}`}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded p-1 transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7]' : 'hover:bg-[#1E1E24]'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${
                isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'
              }`}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputClass}`}
              placeholder="Enter name..."
              required
            />
          </div>

          {/* In a real app, we'd have icon picker and color picker */}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                isLightTheme
                  ? 'border-[#D4D4D8] text-[#18181B] hover:bg-[#F4F4F5]'
                  : 'border-[#27272A] text-white hover:bg-[#1E1E24]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-[#E4E4E7]"
            >
              {editingItem ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}