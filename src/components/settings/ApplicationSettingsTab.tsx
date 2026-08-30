import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, FolderOpen, RotateCcw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ApplicationSettingsTabProps {
  isLightTheme: boolean
  onThemeChange: (theme: string) => void
}

type Preferences = {
  username?: string
  appName?: string
  currency?: string
  theme?: string
  backupPath?: string
  automaticBackups?: boolean
  frequency?: string
}

const frequencies = [
  { value: 'Daily', label: 'Daily at 02:00' },
  { value: 'Weekly', label: 'Weekly (Every Sunday)' },
  { value: 'Monthly', label: 'Monthly First Day' },
  { value: 'Manual', label: 'Manual Backups Only' },
]

export function ApplicationSettingsTab({ isLightTheme, onThemeChange }: ApplicationSettingsTabProps) {
  const [appName, setAppName] = useState('Dystomentum Personal Ledger')
  const [username, setUsername] = useState('Operator')
  const [currency, setCurrency] = useState('USD')
  const [backupPath, setBackupPath] = useState('')
  const [automaticBackups, setAutomaticBackups] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState('Daily')
  const [theme, setTheme] = useState('Dark')
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void window.electronAPI.invoke('get-setup-preferences').then((response) => {
      if (!response || typeof response !== 'object') return
      const preferences = response as Preferences
      setUsername(preferences.username ?? 'Operator')
      setAppName(preferences.appName ?? 'Dystomentum Personal Ledger')
      setCurrency((preferences.currency ?? 'USD').slice(0, 3).toUpperCase())
      setBackupPath(preferences.backupPath ?? '')
      setAutomaticBackups(preferences.automaticBackups !== false)
      setBackupFrequency(frequencies.some((option) => option.value === preferences.frequency) ? preferences.frequency! : 'Daily')
      setTheme(preferences.theme === 'Light' ? 'Light' : 'Dark')
    }).catch(() => setStatus('Unable to load saved settings.'))
  }, [])

  const panelClass = isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'
  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'
  const labelClass = 'text-[#71717A]'
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const selectContentClass = isLightTheme ? 'border-[#D4D4D8] bg-white text-[#18181B]' : 'border-[#27272A] bg-[#18181B] text-white'

  const saveSettings = async () => {
    const normalizedName = appName.trim()
    const normalizedUsername = username.trim()
    const normalizedBackupPath = backupPath.trim()
    if (!normalizedName) {
      setStatus('Application name is required.')
      return
    }
    if (!normalizedUsername) {
      setStatus('Operator username is required.')
      return
    }
    if (!normalizedBackupPath) {
      setStatus('Backup path is required.')
      return
    }

    setIsSaving(true)
    setStatus('')
    try {
      await window.electronAPI.invoke('save-setup-preferences', {
        username: normalizedUsername,
        appName: normalizedName,
        currency,
        backupPath: normalizedBackupPath,
        automaticBackups,
        frequency: backupFrequency,
        theme,
      })
      onThemeChange(theme)
      setStatus('Settings saved locally.')
    } catch {
      setStatus('Unable to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const resetSettings = async () => {
    if (!window.confirm('Reset application settings to their defaults? Your transactions and categories will not be deleted.')) return
    setIsSaving(true)
    setStatus('')
    try {
      const response = await window.electronAPI.invoke('reset-setup-preferences')
      const preferences = response as Preferences
      setUsername(preferences.username ?? 'Operator')
      setAppName(preferences.appName ?? 'Dystomentum Personal Ledger')
      setCurrency(preferences.currency ?? 'USD')
      setBackupPath(preferences.backupPath ?? '')
      setAutomaticBackups(preferences.automaticBackups !== false)
      setBackupFrequency(preferences.frequency ?? 'Daily')
      setTheme(preferences.theme ?? 'Dark')
      onThemeChange(preferences.theme ?? 'Dark')
      setStatus('Settings reset. Ledger data was preserved.')
    } catch {
      setStatus('Unable to reset settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const renderSelectItems = (options: Array<{ value: string; label: string }>) => options.map((option) => (
    <Select.Item key={option.value} value={option.value} className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${isLightTheme ? 'focus:bg-[#F4F4F5]' : 'focus:bg-[#1E1E24]'}`}>
      <Select.ItemText>{option.label}</Select.ItemText>
      <Select.ItemIndicator><Check className="h-4 w-4" /></Select.ItemIndicator>
    </Select.Item>
  ))

  const browseBackupPath = async () => {
    setStatus('')
    try {
      const selectedPath = await window.electronAPI.invoke('select-backup-location')
      if (typeof selectedPath === 'string' && selectedPath.trim()) setBackupPath(selectedPath)
    } catch {
      setStatus('Unable to choose backup path.')
    }
  }

  return (
    <div className={`space-y-6 rounded-[12px] border p-6 ${panelClass}`}>
      <div className="space-y-4">
        <div>
          <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>Application Workspace Name</label>
          <input type="text" maxLength={80} value={appName} onChange={(event) => setAppName(event.target.value)} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputClass}`} />
        </div>

        <div>
          <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>Operator Username</label>
          <input type="text" maxLength={32} value={username} onChange={(event) => setUsername(event.target.value)} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputClass}`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>Default Currency</label>
            <Select.Root value={currency} onValueChange={setCurrency}>
              <Select.Trigger className={`flex h-[46px] w-full items-center justify-between rounded-xl border px-3 text-left text-sm outline-none ${inputClass}`}><Select.Value /><Select.Icon><ChevronDown className="h-4 w-4 text-[#71717A]" /></Select.Icon></Select.Trigger>
              <Select.Portal><Select.Content position="popper" side="bottom" align="start" sideOffset={6} className={`dropdown-panel z-[1000] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}><Select.Viewport className="p-1">{renderSelectItems([{ value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' }, { value: 'GBP', label: 'GBP (£)' }, { value: 'PKR', label: 'PKR (Rs)' }])}</Select.Viewport></Select.Content></Select.Portal>
            </Select.Root>
          </div>

          <div>
            <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>Interface Theme</label>
            <Select.Root value={theme} onValueChange={(nextTheme) => { setTheme(nextTheme); onThemeChange(nextTheme) }}>
              <Select.Trigger className={`flex h-[46px] w-full items-center justify-between rounded-xl border px-3 text-left text-sm outline-none ${inputClass}`}><Select.Value /><Select.Icon><ChevronDown className="h-4 w-4 text-[#71717A]" /></Select.Icon></Select.Trigger>
              <Select.Portal><Select.Content position="popper" side="bottom" align="start" sideOffset={6} className={`dropdown-panel z-[1000] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}><Select.Viewport className="p-1">{renderSelectItems([{ value: 'Dark', label: 'Dark' }, { value: 'Light', label: 'Light' }])}</Select.Viewport></Select.Content></Select.Portal>
            </Select.Root>
          </div>
        </div>

        <div>
          <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>Backup Schedule Frequency</label>
          <Select.Root value={backupFrequency} onValueChange={setBackupFrequency}>
            <Select.Trigger className={`flex h-[46px] w-full items-center justify-between rounded-xl border px-3 text-left text-sm outline-none ${inputClass}`}><Select.Value /><Select.Icon><ChevronDown className="h-4 w-4 text-[#71717A]" /></Select.Icon></Select.Trigger>
            <Select.Portal><Select.Content position="popper" side="bottom" align="start" sideOffset={6} className={`dropdown-panel z-[1000] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}><Select.Viewport className="p-1">{renderSelectItems(frequencies)}</Select.Viewport></Select.Content></Select.Portal>
          </Select.Root>
        </div>

        <div>
          <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>Backup Folder</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={backupPath}
              onChange={(event) => setBackupPath(event.target.value)}
              className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 font-mono text-sm outline-none ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => void browseBackupPath()}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                isLightTheme
                  ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] hover:bg-[#E4E4E7]'
                  : 'border-[#27272A] bg-[#121215] text-white hover:bg-[#1E1E24]'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              Browse
            </button>
          </div>
          <div className={`mt-2 break-all rounded-xl border px-3 py-2 font-mono text-xs ${isLightTheme ? 'border-[#E4E4E7] bg-[#FAFAFA] text-[#52525B]' : 'border-[#27272A] bg-[#121215] text-[#A1A1AA]'}`}>
            {backupPath || 'No backup folder selected'}
          </div>
        </div>

        <div className={`flex items-center justify-between rounded-xl border p-4 ${isLightTheme ? 'border-[#D4D4D8] bg-[#F4F4F5]' : 'border-[#27272A] bg-[#121215]'}`}>
          <div>
            <div className={`text-sm font-bold ${headingClass}`}>Automatic Backups</div>
            <div className={`text-xs ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>Allows the backend backup check job to use this folder.</div>
          </div>
          <button
            type="button"
            aria-pressed={automaticBackups}
            onClick={() => setAutomaticBackups((value) => !value)}
            className={`relative h-6 w-11 rounded-full transition ${automaticBackups ? (isLightTheme ? 'bg-[#18181B]' : 'bg-white') : (isLightTheme ? 'bg-[#D4D4D8]' : 'bg-[#3F3F46]')}`}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full transition-all ${automaticBackups ? (isLightTheme ? 'right-1 bg-white' : 'right-1 bg-black') : 'left-1 bg-[#A1A1AA]'}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#27272A] pt-5">
        <p role="status" className={`text-sm ${status.includes('Unable') || status.includes('required') ? 'text-red-400' : 'text-[#A1A1AA]'}`}>{status}</p>
        <button type="button" disabled={isSaving} onClick={() => void saveSettings()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-[#E4E4E7] disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{isSaving ? 'Saving…' : 'Save Settings'}</button>
      </div>

      <div className={`rounded-xl border p-4 ${isLightTheme ? 'border-[#FCA5A5] bg-[#FEF2F2]' : 'border-[#7F1D1D] bg-[#260B0B]'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className={`text-sm font-bold ${headingClass}`}>Reset Application Settings</h3><p className={`text-xs ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>Resets preferences only. Your database ledger, categories, and payment methods are preserved.</p></div>
          <button type="button" disabled={isSaving} onClick={() => void resetSettings()} className="inline-flex items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-60"><RotateCcw className="h-4 w-4" />Reset</button>
        </div>
      </div>
    </div>
  )
}
