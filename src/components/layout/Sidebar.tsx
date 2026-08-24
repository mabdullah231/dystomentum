import { BarChart3, ChartNoAxesCombined, ChevronLeft, ChevronRight, CircleDollarSign, Download, FolderKanban, Gauge, HardDrive, Plus, ReceiptText, Settings, WalletCards } from 'lucide-react'
import { Button } from '../ui/button'
import { NavItem } from './NavItem'

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  isLightTheme: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const navigation = [
  { label: 'Dashboard', icon: Gauge },
  { label: 'Transactions', icon: ReceiptText },
  { label: 'Income', icon: CircleDollarSign },
  { label: 'Expenses', icon: WalletCards },
  { label: 'Categories', icon: FolderKanban },
  { label: 'Reports', icon: ChartNoAxesCombined },
  { label: 'Export', icon: Download },
  { label: 'Backup & Restore', icon: HardDrive },
]

export function Sidebar({ activePage, onNavigate, isLightTheme, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside className={`fixed bottom-0 left-0 top-9 flex flex-col border-r px-2 py-4 transition-[width,background-color,border-color,box-shadow] duration-300 lg:z-20 lg:w-60 lg:px-3 lg:py-5 ${isCollapsed ? 'z-20 w-16' : 'z-40 w-60 shadow-2xl shadow-black/40'} ${isLightTheme ? 'border-[#D4D4D8] bg-[#FFFFFF]' : 'border-[#1E1E22] bg-[#121215]'}`}>
      <Button title="New Transaction" aria-label="New Transaction" className={`mb-6 h-10 w-full px-0 lg:h-auto lg:px-4 ${!isCollapsed && 'px-4'}`} onClick={() => onNavigate('New Transaction')}>
        <Plus className="h-4 w-4" />
        <span className={`${isCollapsed ? 'hidden' : 'inline'} lg:inline`}>New Transaction</span>
      </Button>
      <nav className="space-y-1" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavItem key={item.label} {...item} isLightTheme={isLightTheme} isCollapsed={isCollapsed} isActive={activePage === item.label} onClick={() => onNavigate(item.label)} />
        ))}
      </nav>
      <div className={`mt-auto border-t pt-3 ${isLightTheme ? 'border-[#D4D4D8]' : 'border-[#1E1E22]'}`}>
        <NavItem icon={Settings} label="Settings" isLightTheme={isLightTheme} isCollapsed={isCollapsed} isActive={activePage === 'Settings'} onClick={() => onNavigate('Settings')} />
        <div className="mt-4 hidden items-center gap-2 px-3 text-[10px] uppercase tracking-[0.16em] text-[#71717A] lg:flex">
          <BarChart3 className="h-3.5 w-3.5" />
          Local workspace
        </div>
      </div>
      <button type="button" title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggleCollapse} className={`absolute -right-3 top-1/2 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition-colors lg:hidden ${isLightTheme ? 'border-[#D4D4D8] bg-white text-[#52525B] hover:bg-[#E4E4E7]' : 'border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] hover:text-white'}`}>
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  )
}
