import { Edit, Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface CategoryItem {
  id: string
  name: string
  icon: React.ReactNode
  iconName?: string
  isDefault: boolean
  transactionCount: number
  color?: string // optional accent color for icon
}

interface CategoryCardProps {
  item: CategoryItem
  isLightTheme: boolean
  onEdit: (item: CategoryItem) => void
  onDelete: (id: string) => void
}

export function CategoryCard({ item, isLightTheme, onEdit, onDelete }: CategoryCardProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const defaultBadgeClass = isLightTheme
    ? 'bg-[#F4F4F5] text-[#52525B] border-[#D4D4D8]'
    : 'bg-[#121215] text-[#A1A1AA] border-[#27272A]'

  return (
    <div
      className={`flex flex-col rounded-[12px] border p-4 ${panelClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: item.color || '#A1A1AA' }}
          >
            {item.icon}
          </div>
          <span className={`font-bold ${headingClass}`}>{item.name}</span>
        </div>
        {item.isDefault && (
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${defaultBadgeClass}`}
          >
            Default
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#27272A] pt-3">
        <span className={`text-xs ${mutedClass}`}>
          {item.transactionCount} {item.transactionCount === 1 ? 'transaction' : 'transactions'}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className={`rounded p-1 transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7] text-[#52525B]' : 'hover:bg-[#1E1E24] text-[#A1A1AA]'
            }`}
            aria-label={`Edit ${item.name}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          {!item.isDefault && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className={`rounded p-1 transition ${
                isLightTheme ? 'hover:bg-[#FEE2E2] text-[#991B1B]' : 'hover:bg-[#2A1A1D] text-[#F87171]'
              }`}
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
