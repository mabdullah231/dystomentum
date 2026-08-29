import { useState } from 'react'
import { SettingsTabs, SettingsTab } from '../components/settings/SettingsTabs'
import { ApplicationSettingsTab } from '../components/settings/ApplicationSettingsTab'
import { AboutClientTab } from '../components/settings/AboutClientTab'
import { KeyboardShortcutsTab } from '../components/settings/KeyboardShortcutsTab'

interface SettingsPageProps {
  isLightTheme?: boolean
}

export function SettingsPage({ isLightTheme = false }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('app_settings')

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      {/* Page Header */}
      <header>
        <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Application Preferences</h1>
        <p className={`mt-1 text-sm ${mutedClass}`}>
          Configure your local client behaviors, styling models, and workspace options.
        </p>
      </header>

      {/* Tab Bar */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} isLightTheme={isLightTheme} />

      {/* Tab Content */}
      <div>
        {activeTab === 'app_settings' && <ApplicationSettingsTab isLightTheme={isLightTheme} />}
        {activeTab === 'about_client' && <AboutClientTab isLightTheme={isLightTheme} />}
        {activeTab === 'shortcuts' && <KeyboardShortcutsTab isLightTheme={isLightTheme} />}
      </div>
    </div>
  )
}