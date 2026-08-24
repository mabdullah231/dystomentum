import { useEffect, useState } from 'react'
import { ChevronDown, Database, LockKeyhole } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/Card'
import { TopTitleBar } from '../layout/TopTitleBar'

export type SetupPreferences = {
  username: string
  currency: string
  theme: string
  backupPath: string
  automaticBackups: boolean
  frequency: string
}

type Step = 1 | 2 | 3

interface SetupOnboardingProps {
  initialPreferences?: Partial<SetupPreferences>
  onComplete: (preferences: SetupPreferences) => Promise<void>
}

const labelClassName = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.16em]'

export function SetupOnboarding({ initialPreferences, onComplete }: SetupOnboardingProps) {
  const [step, setStep] = useState<Step>(1)
  const [username, setUsername] = useState(initialPreferences?.username ?? '')
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [currency, setCurrency] = useState(initialPreferences?.currency ?? 'USD — US Dollar')
  const [theme, setTheme] = useState(initialPreferences?.theme ?? 'Dark')
  const [backupPath, setBackupPath] = useState(initialPreferences?.backupPath ?? 'D:\\Backups\\Dystomentum\\backup_vault.db')
  const [automaticBackups, setAutomaticBackups] = useState(initialPreferences?.automaticBackups ?? true)
  const [frequency, setFrequency] = useState(initialPreferences?.frequency ?? 'Daily')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [systemPrefersLight, setSystemPrefersLight] = useState(false)
  const [databasePath, setDatabasePath] = useState('Loading local vault path…')

  useEffect(() => {
    void window.electronAPI.invoke('get-database-location').then((location) => {
      if (typeof location === 'string') setDatabasePath(location)
    })
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const updateSystemTheme = () => setSystemPrefersLight(mediaQuery.matches)
    updateSystemTheme()
    mediaQuery.addEventListener('change', updateSystemTheme)
    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  const isLightTheme = theme === 'Light' || (theme === 'Follow System' && systemPrefersLight)
  const fieldClassName = isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B]' : 'border-[#27272A] bg-[#121215] text-white'
  const labelTextClassName = isLightTheme ? 'text-[#52525B]' : 'text-[#71717A]'
  const inputClassName = `w-full rounded-lg border px-3 py-3 font-mono text-sm outline-none transition-colors duration-300 focus:border-[#3B82F6] ${fieldClassName}`
  const normalizedUsername = username.trim()
  const usernameError = normalizedUsername.length === 0 ? 'Enter an operator username.' : normalizedUsername.length < 2 ? 'Use at least 2 characters.' : normalizedUsername.length > 32 ? 'Use 32 characters or fewer.' : !/^[a-zA-Z0-9 _-]+$/.test(normalizedUsername) ? 'Use only letters, numbers, spaces, underscores, or hyphens.' : ''
  const stepContent = {
    1: ['Welcome to Dystomentum', 'To begin, establish your workspace profile. All accounting files and keys will reside locally under this identifier.'],
    2: ['System Preferences', 'Define local reporting formats and display configurations.'],
    3: ['Data Storage & Backup', 'Dystomentum is local-only. Configure your accounting vault location.'],
  }[step]

  function continueToNextStep(): void {
    if (step === 1) {
      setUsernameTouched(true)
      if (usernameError) return
    }
    setStep((step + 1) as Step)
  }

  async function browseForBackup(): Promise<void> {
    const selectedPath = await window.electronAPI.invoke('select-backup-location') as string | null
    if (selectedPath) setBackupPath(selectedPath)
  }

  async function submit(): Promise<void> {
    setIsSubmitting(true)
    await onComplete({ username: normalizedUsername, currency, theme, backupPath, automaticBackups, frequency })
    setIsSubmitting(false)
  }

  return (
    <main className={`flex min-h-screen items-center justify-center px-4 pb-10 pt-[76px] transition-colors duration-700 ${isLightTheme ? 'bg-[#F4F4F5] text-[#18181B]' : 'bg-[#0A0A0C] text-white'}`}>
      <TopTitleBar title="Setup" />
      <section className="w-full max-w-[480px] animate-screen-enter" aria-labelledby="setup-title">
        <div className="mb-5 flex justify-center gap-2" aria-label={`Setup step ${step} of 3`}>
          {([1, 2, 3] as Step[]).map((item) => <span key={item} className={`h-2.5 w-2.5 rounded-full ${item === step ? 'bg-white ring-2 ring-[#3B82F6] ring-offset-2 ring-offset-[#0A0A0C]' : 'bg-[#3F3F46]'}`} />)}
        </div>
        <Card className={`p-6 shadow-2xl shadow-black/20 transition-colors duration-700 sm:p-8 ${isLightTheme ? 'border-[#D4D4D8] bg-white' : ''}`}>
          <div key={step} className="animate-step-enter">
            <h1 id="setup-title" className={`text-[22px] font-bold tracking-tight ${isLightTheme ? 'text-[#18181B]' : 'text-white'}`}>{stepContent[0]}</h1>
            <p className={`mt-2 text-sm leading-6 ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>{stepContent[1]}</p>
            {step === 1 && <div className="mt-7 space-y-5"><label className="block"><span className={`${labelClassName} ${labelTextClassName}`}>Operator Username</span><input className={inputClassName} placeholder="Operator username" value={username} onChange={(event) => setUsername(event.target.value)} onBlur={() => setUsernameTouched(true)} aria-invalid={Boolean(usernameTouched && usernameError)} />{usernameTouched && usernameError && <span className="mt-2 block text-xs text-red-400">{usernameError}</span>}</label><div className={`flex gap-3 rounded-lg border p-3 text-xs leading-5 ${fieldClassName} ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#71717A]" /><span>Your data stays on this device. No account or internet required.</span></div></div>}
            {step === 2 && <div className="mt-7 space-y-5"><label className="block"><span className={`${labelClassName} ${labelTextClassName}`}>Default Currency</span><span className="relative block"><select className={`${inputClassName} appearance-none`} value={currency} onChange={(event) => setCurrency(event.target.value)}><option>USD — US Dollar</option><option>EUR — Euro</option><option>GBP — Pound Sterling</option><option>PKR — Pakistan Rupee</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#71717A]" /></span></label><fieldset><legend className={`${labelClassName} ${labelTextClassName}`}>Interface Theme</legend><div className="space-y-2">{['Dark', 'Light', 'Follow System'].map((option) => <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-300 ${theme === option ? (isLightTheme ? 'bg-[#E4E4E7] text-[#18181B]' : 'bg-[#121215] text-white') : (isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]')}`}><input type="radio" name="theme" value={option} checked={theme === option} onChange={() => setTheme(option)} className="accent-[#3B82F6]" />{option}</label>)}</div></fieldset><div><span className={`${labelClassName} ${labelTextClassName}`}>Format Preview</span><div className={`rounded-lg px-3 py-3 text-center text-sm font-bold ${fieldClassName}`}>{currency.startsWith('EUR') ? '€1,234.56' : currency.startsWith('GBP') ? '£1,234.56' : currency.startsWith('PKR') ? '₨1,234.56' : '$1,234.56'}</div></div></div>}
            {step === 3 && <div className="mt-7 space-y-5"><label className="block"><span className={`${labelClassName} ${labelTextClassName}`}>Database Vault Location</span><div className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-xs ${fieldClassName} text-[#71717A]`}><Database className="h-4 w-4 shrink-0" /><span className="truncate font-mono">{databasePath}</span></div></label><label className="block"><span className={`${labelClassName} ${labelTextClassName}`}>Backup Vault Location</span><div className="flex gap-2"><input className={`${inputClassName} min-w-0`} value={backupPath} onChange={(event) => setBackupPath(event.target.value)} /><button type="button" onClick={() => void browseForBackup()} className="rounded-md border border-[#3F3F46] bg-[#1D1D21] px-3 text-sm text-white transition hover:bg-[#27272A]">Browse</button></div></label><div className="flex items-center justify-between"><div><p className={`text-sm ${isLightTheme ? 'text-[#18181B]' : 'text-white'}`}>Automatic Backups</p><p className="mt-1 text-xs text-[#71717A]">Saves a snapshots automatically</p></div><button type="button" aria-pressed={automaticBackups} onClick={() => setAutomaticBackups((value) => !value)} className={`relative h-6 w-11 rounded-full transition duration-300 ${automaticBackups ? (isLightTheme ? 'bg-[#18181B]' : 'bg-white') : (isLightTheme ? 'bg-[#D4D4D8]' : 'bg-[#3F3F46]')}`}><span className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-300 ${automaticBackups ? (isLightTheme ? 'right-1 bg-white' : 'right-1 bg-black') : 'left-1 bg-[#A1A1AA]'}`} /></button></div><label className="block"><span className={`${labelClassName} ${labelTextClassName}`}>Backup Frequency</span><span className="relative block"><select className={`${inputClassName} appearance-none`} value={frequency} onChange={(event) => setFrequency(event.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#71717A]" /></span></label></div>}
            <div className="mt-8 flex gap-3">{step > 1 && <Button type="button" variant="secondary" onClick={() => setStep((step - 1) as Step)}>Back</Button>}<Button type="button" className="flex-1" disabled={isSubmitting} onClick={() => step === 3 ? void submit() : continueToNextStep()}>{step === 3 ? (isSubmitting ? 'Starting…' : 'Start Using Dystomentum') : 'Continue'}</Button></div>
          </div>
        </Card>
      </section>
    </main>
  )
}
