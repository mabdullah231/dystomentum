import { cn } from '../../utils/cn'

export type TabType = 'income' | 'expense' | 'payment'

interface CategoryTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  isLightTheme: boolean
}

const tabs: Array<{ id: TabType; label: string }> = [
  { id: 'income', label: 'Income Categories' },
  { id: 'expense', label: 'Expense Categories' },
  { id: 'payment', label: 'Payment Methods' },
]

export function CategoryTabs({ activeTab, onTabChange, isLightTheme }: CategoryTabsProps) {
  const bgInactive = isLightTheme ? 'bg-[#F4F4F5]' : 'bg-[#121215]'
  const bgActive = isLightTheme ? 'bg-white' : 'bg-[#18181B]'
  const textInactive = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const textActive = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const borderActive = isLightTheme ? 'border-[#D4D4D8]' : 'border-[#27272A]'

  return (
    <div
      className={`inline-flex rounded-full border p-1 ${isLightTheme ? 'border-[#D4D4D8]' : 'border-[#27272A]'}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
              isActive
                ? `${bgActive} ${textActive} ${borderActive} border shadow-sm`
                : `${bgInactive} ${textInactive} hover:text-white`
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}