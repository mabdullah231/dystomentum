import { useState } from 'react'
import {
  Home,
  Utensils,
  Car,
  Zap,
  Briefcase,
  Film,
  ShoppingBag,
  Coffee,
  Activity,
  CreditCard,
  Wallet,
  Landmark,
  Smartphone,
} from 'lucide-react'
import { CategoryTabs, TabType } from '../components/categories/CategoryTabs'
import { CategoryCard, CategoryItem } from '../components/categories/CategoryCard'
import { CategoryModal } from '../components/categories/CategoryModal'

interface CategoriesPageProps {
  isLightTheme?: boolean
}

// Sample data – will be replaced with real DB data
const sampleIncomeCategories: CategoryItem[] = [
  { id: 'inc1', name: 'Salary', icon: <Briefcase className="h-5 w-5" />, isDefault: true, transactionCount: 45, color: '#10B981' },
  { id: 'inc2', name: 'Freelance', icon: <Activity className="h-5 w-5" />, isDefault: false, transactionCount: 12, color: '#3B82F6' },
  { id: 'inc3', name: 'Dividends', icon: <Landmark className="h-5 w-5" />, isDefault: false, transactionCount: 8, color: '#8B5CF6' },
]

const sampleExpenseCategories: CategoryItem[] = [
  { id: 'exp1', name: 'Housing', icon: <Home className="h-5 w-5" />, isDefault: true, transactionCount: 34, color: '#F87171' },
  { id: 'exp2', name: 'Food & Dining', icon: <Utensils className="h-5 w-5" />, isDefault: true, transactionCount: 89, color: '#F59E0B' },
  { id: 'exp3', name: 'Transportation', icon: <Car className="h-5 w-5" />, isDefault: true, transactionCount: 42, color: '#3B82F6' },
  { id: 'exp4', name: 'Utilities', icon: <Zap className="h-5 w-5" />, isDefault: true, transactionCount: 27, color: '#8B5CF6' },
  { id: 'exp5', name: 'Entertainment', icon: <Film className="h-5 w-5" />, isDefault: false, transactionCount: 15, color: '#EC4899' },
  { id: 'exp6', name: 'Shopping', icon: <ShoppingBag className="h-5 w-5" />, isDefault: false, transactionCount: 23, color: '#14B8A6' },
  { id: 'exp7', name: 'Coffee Shops', icon: <Coffee className="h-5 w-5" />, isDefault: false, transactionCount: 6, color: '#92400E' },
]

const samplePaymentMethods: CategoryItem[] = [
  { id: 'pm1', name: 'Bank Transfer', icon: <Landmark className="h-5 w-5" />, isDefault: true, transactionCount: 156, color: '#3B82F6' },
  { id: 'pm2', name: 'Credit Card', icon: <CreditCard className="h-5 w-5" />, isDefault: true, transactionCount: 89, color: '#8B5CF6' },
  { id: 'pm3', name: 'Crypto Wallet', icon: <Wallet className="h-5 w-5" />, isDefault: false, transactionCount: 23, color: '#F59E0B' },
  { id: 'pm4', name: 'Direct Debit', icon: <Smartphone className="h-5 w-5" />, isDefault: false, transactionCount: 12, color: '#10B981' },
]

export function CategoriesPage({ isLightTheme = false }: CategoriesPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('expense')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)

  // In a real app, these would be fetched from DB
  const getItemsForTab = (): CategoryItem[] => {
    switch (activeTab) {
      case 'income':
        return sampleIncomeCategories
      case 'expense':
        return sampleExpenseCategories
      case 'payment':
        return samplePaymentMethods
      default:
        return []
    }
  }

  const items = getItemsForTab()

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  const handleAdd = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleEdit = (item: CategoryItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // In real app, call IPC to delete
      console.log('Delete:', id)
    }
  }

  const handleSave = (data: any) => {
    // In real app, call IPC to save (insert or update)
    console.log('Save:', data)
  }

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      {/* Page Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Category Settings</h1>
          <p className={`mt-1 text-sm ${mutedClass}`}>
            Organize, edit, and custom-label your offline database tags.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-[#E4E4E7]"
          onClick={handleAdd}
        >
          + Add Category
        </button>
      </header>

      {/* Tabs */}
      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} isLightTheme={isLightTheme} />

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <CategoryCard
            key={item.id}
            item={item}
            isLightTheme={isLightTheme}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingItem={editingItem}
        type={activeTab === 'payment' ? 'payment' : activeTab}
        isLightTheme={isLightTheme}
      />
    </div>
  )
}