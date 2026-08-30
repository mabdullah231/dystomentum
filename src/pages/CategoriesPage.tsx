import { useEffect, useState, type ReactNode } from 'react'
import {
  Activity, Briefcase, Car, Coffee, CreditCard, Film, Home, Landmark, ShoppingBag, Smartphone, TrendingUp, Tv, Utensils, Wallet, Zap,
} from 'lucide-react'
import { CategoryTabs, TabType } from '../components/categories/CategoryTabs'
import { CategoryCard, CategoryItem } from '../components/categories/CategoryCard'
import { CategoryFormData, CategoryModal } from '../components/categories/CategoryModal'
import { toast } from 'sonner'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface CategoriesPageProps {
  isLightTheme?: boolean
}

type CatalogResponse = {
  id: number
  name: string
  icon: string | null
  color: string | null
  isDefault: boolean
  transactionCount: number
}

const iconMap: Record<string, ReactNode> = {
  home: <Home className="h-5 w-5" />, utensils: <Utensils className="h-5 w-5" />, car: <Car className="h-5 w-5" />,
  zap: <Zap className="h-5 w-5" />, briefcase: <Briefcase className="h-5 w-5" />, film: <Film className="h-5 w-5" />,
  'trending-up': <TrendingUp className="h-5 w-5" />, tv: <Tv className="h-5 w-5" />,
  shopping: <ShoppingBag className="h-5 w-5" />, coffee: <Coffee className="h-5 w-5" />, activity: <Activity className="h-5 w-5" />,
  'credit-card': <CreditCard className="h-5 w-5" />, wallet: <Wallet className="h-5 w-5" />, landmark: <Landmark className="h-5 w-5" />,
  smartphone: <Smartphone className="h-5 w-5" />,
}

const defaultsByTab: Record<TabType, { icon: string; color: string }> = {
  income: { icon: 'briefcase', color: '#10B981' },
  expense: { icon: 'shopping', color: '#3B82F6' },
  payment: { icon: 'credit-card', color: '#8B5CF6' },
}


function toCategoryItem(item: CatalogResponse, fallback: { icon: string; color: string }): CategoryItem {
  const iconName = item.icon || fallback.icon
  return {
    id: String(item.id), name: item.name, icon: iconMap[iconName] ?? <Activity className="h-5 w-5" />, iconName,
    isDefault: item.isDefault, transactionCount: item.transactionCount, color: item.color || fallback.color,
  }
}

export function CategoriesPage({ isLightTheme = false }: CategoriesPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('expense')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)
  const [items, setItems] = useState<CategoryItem[]>([])
  const [error, setError] = useState('')
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
  const loadItems = async () => {
    const channel = activeTab === 'payment' ? 'list-payment-methods' : 'list-categories'
    const type = activeTab === 'income' ? 'Income' : 'Expense'
    const result = await window.electronAPI.invoke(channel, ...(activeTab === 'payment' ? [] : [type]))
    if (!Array.isArray(result)) throw new Error('Invalid catalog response.')
    setItems(result.map((item) => toCategoryItem(item as CatalogResponse, defaultsByTab[activeTab])))
  }

  useEffect(() => {
    setError('')
    void loadItems().catch((reason: unknown) => {
      setItems([])
      setError(reason instanceof Error ? reason.message : 'Unable to load catalog items.')
    })
  }, [activeTab])

  const runMutation = async (operation: () => Promise<unknown>) => {
    setError('')
    try {
      await operation()
      await loadItems()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save catalog item.')
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleEdit = (item: CategoryItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  // const handleDelete = (id: string) => {
  //   if (!window.confirm('Are you sure you want to delete this item?')) return
  //   const channel = activeTab === 'payment' ? 'delete-payment-method' : 'delete-category'
  //   void runMutation(() => window.electronAPI.invoke(channel, Number(id)))
  // }

  const closeConfirm = () => {
  setConfirmState((prev) => ({ ...prev, isOpen: false }))
}

  const handleDelete = (id: string, name: string) => {
  setConfirmState({
    isOpen: true,
    title: `Delete ${activeTab === 'payment' ? 'Payment Method' : 'Category'}`,
    message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
    onConfirm: async () => {
      setConfirmState((prev) => ({ ...prev, isOpen: false }))
      const channel = activeTab === 'payment' ? 'delete-payment-method' : 'delete-category'
      try {
        await window.electronAPI.invoke(channel, Number(id))
        toast.success(`${activeTab === 'payment' ? 'Payment method' : 'Category'} deleted`)
        await loadItems()
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unable to delete.'
        toast.error('Delete failed', { description: msg })
      }
    },
  })
}

 const handleSave = (data: CategoryFormData) => {
    const defaults = defaultsByTab[activeTab]
    const payload = { name: data.name, icon: data.iconName ?? defaults.icon, color: data.color ?? defaults.color }
    const isPaymentMethod = activeTab === 'payment'
    const channel = data.id
      ? (isPaymentMethod ? 'update-payment-method' : 'update-category')
      : (isPaymentMethod ? 'create-payment-method' : 'create-category')

    const action = data.id
      ? window.electronAPI.invoke(channel, Number(data.id), payload)
      : isPaymentMethod
        ? window.electronAPI.invoke(channel, payload)
        : window.electronAPI.invoke(channel, activeTab === 'income' ? 'Income' : 'Expense', payload)

    const successMessage = data.id
      ? `${isPaymentMethod ? 'Payment method' : 'Category'} updated`
      : `${isPaymentMethod ? 'Payment method' : 'Category'} created`

    void runMutation(() => action, successMessage)
  }

  const changeTab = (tab: TabType) => {
    setActiveTab(tab)
    setEditingItem(null)
    setModalOpen(false)
  }

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Category Settings</h1>
          <p className={`mt-1 text-sm ${mutedClass}`}>Organize, edit, and custom-label your offline database tags.</p>
        </div>
        <button type="button" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-[#E4E4E7]" onClick={handleAdd}>
          + Add Category
        </button>
      </header>

      <CategoryTabs activeTab={activeTab} onTabChange={changeTab} isLightTheme={isLightTheme} />
      {error && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => <CategoryCard key={item.id} item={item} isLightTheme={isLightTheme} onEdit={handleEdit}  onDelete={(id) => handleDelete(id, item.name)} />)}
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
