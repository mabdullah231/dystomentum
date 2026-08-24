import { cloneElement, type ReactElement, useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopTitleBar } from './TopTitleBar'

interface AppLayoutProps {
  children: ReactElement<{ isLightTheme?: boolean }>
  initialTheme?: string
}

export function AppLayout({ children, initialTheme = 'Dark' }: AppLayoutProps) {
  const [activePage, setActivePage] = useState('Dashboard')
  const [isLightTheme, setIsLightTheme] = useState(initialTheme === 'Light')
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLightTheme ? 'bg-[#F4F4F5] text-[#18181B]' : 'bg-[#0A0A0C] text-white'}`}>
      <TopTitleBar title="Dashboard - Workspace: Local" isLightTheme={isLightTheme} onToggleTheme={() => setIsLightTheme((value) => !value)} />
      <Sidebar activePage={activePage} onNavigate={setActivePage} isLightTheme={isLightTheme} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed((value) => !value)} />
      <main className="ml-16 min-h-screen min-w-0 overflow-y-auto pt-9 lg:ml-60">
        <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">{cloneElement(children, { isLightTheme })}</div>
      </main>
    </div>
  )
}
