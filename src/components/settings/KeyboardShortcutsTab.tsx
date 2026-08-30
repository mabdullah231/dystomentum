import { keyboardShortcuts } from '../../constants/keyboardShortcuts'

interface KeyboardShortcutsTabProps {
  isLightTheme: boolean
}

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
        {keyboardShortcuts.map((item) => (
          <div
            key={item.action}
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
