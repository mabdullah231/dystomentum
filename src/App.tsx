import { useEffect, useState } from 'react'
import { AppLayout } from './components/layout'
import { SetupOnboarding, type SetupPreferences } from './components/onboarding/SetupOnboarding'
import { SplashScreen } from './components/onboarding/SplashScreen'
import { DashboardPage } from './pages/DashboardPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { IncomePage } from './pages/IncomePage'
import { NewTransactionSheet } from './components/transactions/NewTransactionSheet'
import { ExpensesPage } from './pages/ExpensesPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ReportsPage } from './pages/ReportsPage'
import { ExportPage } from './pages/ExportPage'
import { BackupRestorePage } from './pages/BackupRestorePage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [setupStatusLoaded, setSetupStatusLoaded] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [setupTheme, setSetupTheme] = useState('Dark')
  const [isLightTheme, setIsLightTheme] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false)

  useEffect(() => {
    const loader = window.setTimeout(() => setIsLoading(false), 1700)
    return () => window.clearTimeout(loader)
  }, [])

  useEffect(() => {
    void window.electronAPI.invoke('get-setup-preferences').then((preferences) => {
      if (preferences && typeof preferences === 'object') {
        const saved = preferences as SetupPreferences
        if (typeof saved.theme === 'string') {
          setSetupTheme(saved.theme)
          setIsLightTheme(saved.theme === 'Light')
        }
        setIsSetupComplete(saved.firstLaunchCompleted ?? true)
      }
      setSetupStatusLoaded(true)
    }).catch(() => setSetupStatusLoaded(true))
  }, [])

  useEffect(() => {
    setIsLightTheme(setupTheme === 'Light')
  }, [setupTheme])

  useEffect(() => {
    void window.electronAPI.invoke('set-window-overlay', isNewTransactionOpen)
  }, [isNewTransactionOpen])

  async function completeSetup(preferences: SetupPreferences): Promise<void> {
    const finalizedPreferences = { ...preferences, firstLaunchCompleted: true }
    await window.electronAPI.invoke('initialize-database', finalizedPreferences)
    setSetupTheme(finalizedPreferences.theme)
    setIsSetupComplete(true)
  }

  async function toggleTheme(): Promise<void> {
    const nextTheme = isLightTheme ? 'Dark' : 'Light'
    setSetupTheme(nextTheme)
    setIsLightTheme(!isLightTheme)

    try {
      await window.electronAPI.invoke('save-setup-preferences', { theme: nextTheme })
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }

  const handleNavigate = (page: string) => {
    if (page === 'New Transaction') {
      setIsNewTransactionOpen(true)
      return
    }

    setActivePage(page)
  }

  const renderPage = (isLightTheme: boolean) => {
    switch (activePage) {
      case 'Dashboard':
        return <div key={activePage} className="page-shell"><DashboardPage isLightTheme={isLightTheme} /></div>
      case 'Transactions':
        return <div key={activePage} className="page-shell"><TransactionsPage isLightTheme={isLightTheme} onOpenNewTransaction={() => setIsNewTransactionOpen(true)} /></div>
      case 'Income':
        return <div key={activePage} className="page-shell"><IncomePage isLightTheme={isLightTheme} /></div>
      case 'Expenses':
        return <div key={activePage} className="page-shell"><ExpensesPage isLightTheme={isLightTheme} /></div>
      case 'Categories':
        return <div key={activePage} className="page-shell"><CategoriesPage isLightTheme={isLightTheme} /></div>
      case 'Reports':
        return <div key={activePage} className="page-shell"><ReportsPage isLightTheme={isLightTheme} /></div>
      case 'Export':
        return <div key={activePage} className="page-shell"><ExportPage isLightTheme={isLightTheme} /></div>
      case 'Backup & Restore':
        return <div key={activePage} className="page-shell"><BackupRestorePage isLightTheme={isLightTheme} /></div>
      case 'Settings':
        return <div key={activePage} className="page-shell"><SettingsPage isLightTheme={isLightTheme} /></div>
      default:
        return <div key={activePage} className="page-shell"><DashboardPage isLightTheme={isLightTheme} /></div>
    }
  }

  if (isLoading || !setupStatusLoaded) return <SplashScreen />

  if (!isSetupComplete) return <SetupOnboarding onComplete={completeSetup} />

  return (
    <>
      <AppLayout
        activePage={activePage}
        onNavigate={handleNavigate}
        currentPage={renderPage(isLightTheme)}
        isLightTheme={isLightTheme}
        onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
        onToggleTheme={toggleTheme}
      />

      {isNewTransactionOpen && (
        <NewTransactionSheet isLightTheme={isLightTheme} onClose={() => setIsNewTransactionOpen(false)} />
      )}
    </>
  )
}

export default App
