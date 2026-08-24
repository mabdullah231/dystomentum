import type { ComponentType } from 'react'

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

interface NavItemProps {
  icon: ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  isLightTheme?: boolean
  isCollapsed?: boolean
  onClick: () => void
}

export function NavItem({ icon: Icon, label, isActive, isLightTheme = false, isCollapsed = true, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        cn(
          'group relative flex w-full gap-3 rounded-md py-2.5 text-left text-sm transition-colors duration-200 lg:justify-start lg:px-3',
          isCollapsed ? 'justify-center px-2' : 'justify-start px-3',
        ),
        isActive ? (isLightTheme ? 'bg-[#E4E4E7] text-[#18181B]' : 'bg-[#1E1E24] text-white') : (isLightTheme ? 'text-[#52525B] hover:bg-[#E4E4E7] hover:text-[#18181B]' : 'text-[#A1A1AA] hover:bg-[#1A1A1E] hover:text-white'),
      )}
    >
      <Icon className={cn('h-4 w-4', isActive ? (isLightTheme ? 'text-[#18181B]' : 'text-white') : 'text-[#71717A]')} />
      <span className={isCollapsed ? 'hidden lg:inline' : 'inline'}>{label}</span>
      {isActive && <span className={`absolute right-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-l ${isLightTheme ? 'bg-[#18181B]' : 'bg-white'}`} />}
    </button>
  )
}
