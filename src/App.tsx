import { useEffect, useState } from 'react'
import { AppLayout } from './components/layout'
import { SetupOnboarding, type SetupPreferences } from './components/onboarding/SetupOnboarding'
import { SplashScreen } from './components/onboarding/SplashScreen'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [setupStatusLoaded, setSetupStatusLoaded] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [setupTheme, setSetupTheme] = useState('Dark')

  useEffect(() => {
    const loader = window.setTimeout(() => setIsLoading(false), 1700)
    return () => window.clearTimeout(loader)
  }, [])

  useEffect(() => {
    void window.electronAPI.invoke('get-setup-preferences').then((preferences) => {
      if (preferences && typeof preferences === 'object') {
        const saved = preferences as SetupPreferences
        if (typeof saved.theme === 'string') setSetupTheme(saved.theme)
        setIsSetupComplete(true)
      }
      setSetupStatusLoaded(true)
    }).catch(() => setSetupStatusLoaded(true))
  }, [])

  async function completeSetup(preferences: SetupPreferences): Promise<void> {
    await window.electronAPI.invoke('initialize-database', preferences)
    setSetupTheme(preferences.theme)
    setIsSetupComplete(true)
  }

  if (isLoading || !setupStatusLoaded) return <SplashScreen />

  if (!isSetupComplete) return <SetupOnboarding onComplete={completeSetup} />

  return (
    <AppLayout initialTheme={setupTheme}>
      <DashboardPage />
    </AppLayout>
  )
}

export default App
