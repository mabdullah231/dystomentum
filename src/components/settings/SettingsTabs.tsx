import { cn } from '../../utils/cn'

export type SettingsTab = 'app_settings' | 'about_client' | 'shortcuts'

interface SettingsTabsProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
  isLightTheme: boolean
}

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'app_settings', label: 'Application Settings' },
  { id: 'about_client', label: 'About Client' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts' },
]

export function SettingsTabs({ activeTab, onTabChange, isLightTheme }: SettingsTabsProps) {
  const bgInactive = isLightTheme ? 'bg-[#F4F4F5]' : 'bg-[#121215]'
  const bgActive = isLightTheme ? 'bg-white' : 'bg-[#18181B]'
  const textInactive = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const textActive = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const borderActive = isLightTheme ? 'border-[#D4D4D8]' : 'border-[#27272A]'
  const inactiveHover = isLightTheme
    ? 'hover:bg-white hover:text-[#18181B] hover:border-[#A1A1AA]'
    : 'hover:text-white hover:border-[#3F3F46]'

  return (
    <div className="flex gap-2">
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
                : `${bgInactive} ${textInactive} border border-transparent ${inactiveHover}`
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
