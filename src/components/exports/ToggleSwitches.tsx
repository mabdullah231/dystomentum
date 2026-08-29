interface ToggleSwitchesProps {
  includeNotes: boolean
  anonymizeValues: boolean
  onToggleNotes: () => void
  onToggleAnonymize: () => void
  isLightTheme: boolean
}

export function ToggleSwitches({
  includeNotes,
  anonymizeValues,
  onToggleNotes,
  onToggleAnonymize,
  isLightTheme,
}: ToggleSwitchesProps) {
  const toggleBg = isLightTheme ? 'bg-[#F4F4F5]' : 'bg-[#121215]'
  const activeBg = isLightTheme ? 'bg-[#18181B]' : 'bg-white'
  const dotActive = isLightTheme ? 'translate-x-5 bg-white' : 'translate-x-5 bg-[#18181B]'
  const dotInactive = isLightTheme ? 'translate-x-0 bg-[#A1A1AA]' : 'translate-x-0 bg-[#71717A]'

  const textClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const subClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  const Toggle = ({ checked, onChange, label, subtext }: { checked: boolean; onChange: () => void; label: string; subtext: string }) => (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${checked ? activeBg : toggleBg}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? dotActive : dotInactive}`} />
      </button>
      <div>
        <div className={`text-sm font-medium ${textClass}`}>{label}</div>
        <div className={`text-xs ${subClass}`}>{subtext}</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Toggle
        checked={includeNotes}
        onChange={onToggleNotes}
        label="Include transaction notes"
        subtext="Export optional commentary and logs"
      />
      <Toggle
        checked={anonymizeValues}
        onChange={onToggleAnonymize}
        label="Anonymize values"
        subtext="Mask direct absolute numbers for presentation"
      />
    </div>
  )
}