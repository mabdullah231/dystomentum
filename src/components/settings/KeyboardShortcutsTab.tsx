import { cn } from '../../utils/cn'

interface KeyboardShortcutsTabProps {
  isLightTheme: boolean
}

const shortcuts = [
  { action: 'Create New Transaction Entry', shortcut: 'Ctrl + N' },
  { action: 'Save Current Ledger Draft', shortcut: 'Ctrl + S' },
  { action: 'Trigger Workspace Export Data', shortcut: 'Ctrl + E' },
  { action: 'Quick Search Description Filter', shortcut: 'Ctrl + F' },
  { action: 'Force Run Database State Backup', shortcut: 'Ctrl + Shift + B' },
  { action: 'Toggle Workspace Light/Dark Theme', shortcut: 'Ctrl + T' },
]

export function KeyboardShortcutsTab({ isLightTheme }: KeyboardShortcutsTabProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  return (
    <div className={`rounded-[12px] border p-6 ${panelClass}`}>
      <h2 className={`text-[16px] font-bold ${headingClass}`}>Interactive Keyboard Shortcuts</h2>
      <div className="mt-4 divide-y divide-[#27272A]">
        {shortcuts.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <span className={`text-sm font-medium ${headingClass}`}>{item.action}</span>
            <span className={`font-mono text-sm ${mutedClass}`}>{item.shortcut}</span>
          </div>
        ))}
      </div>
    </div>
  )
}