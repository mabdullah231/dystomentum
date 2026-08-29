interface PlaceholderPageProps {
  title: string
  subtitle: string
  isLightTheme?: boolean
}

export function PlaceholderPage({ title, subtitle, isLightTheme = false }: PlaceholderPageProps) {
  const panelClassName = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'
  const headingClassName = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const secondaryClassName = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className={`w-full max-w-2xl rounded-[16px] border p-8 text-center ${panelClassName}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#71717A]">Coming soon</p>
        <h1 className={`mt-4 text-[28px] font-bold tracking-tight ${headingClassName}`}>{title}</h1>
        <p className={`mt-3 text-base ${secondaryClassName}`}>{subtitle}</p>
      </div>
    </div>
  )
}
