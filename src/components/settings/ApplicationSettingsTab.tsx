import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/cn'

interface ApplicationSettingsTabProps {
  isLightTheme: boolean
}

export function ApplicationSettingsTab({ isLightTheme }: ApplicationSettingsTabProps) {
  const [appName, setAppName] = useState('Dystomentum Personal Ledger')
  const [currency, setCurrency] = useState('USD')
  const [backupFrequency, setBackupFrequency] = useState('daily')

  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] placeholder:text-[#71717A]'
    : 'border-[#27272A] bg-[#121215] text-white placeholder:text-[#71717A]'

  const labelClass = isLightTheme ? 'text-[#71717A]' : 'text-[#71717A]'
  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'

  const dangerBg = isLightTheme ? 'bg-[#FEF2F2]' : 'bg-[#260B0B]'
  const dangerBorder = isLightTheme ? 'border-[#FCA5A5]' : 'border-[#7F1D1D]'

  const selectContentClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white text-[#18181B]'
    : 'border-[#27272A] bg-[#18181B] text-white'

  return (
    <div className={`space-y-6 rounded-[12px] border p-6 ${panelClass}`}>
      {/* General Settings */}
      <div className="space-y-4">
        {/* Application Name */}
        <div>
          <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>
            Application Workspace Name
          </label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputClass}`}
          />
        </div>

        {/* Currency */}
        <div>
          <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>
            Default Currency Symbol
          </label>
          <Select.Root value={currency} onValueChange={setCurrency}>
            <Select.Trigger
              className={`flex h-[46px] w-full items-center justify-between rounded-xl border px-3 text-left text-sm outline-none ${inputClass}`}
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-4 w-4 text-[#71717A]" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                side="bottom"
                align="start"
                sideOffset={6}
                avoidCollisions
                className={`z-[1000] w-[200px] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}
              >
                <Select.Viewport className="p-1">
                  {[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'PKR', label: 'PKR (Rs)' },
                  ].map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${
                        isLightTheme ? 'focus:bg-[#F4F4F5]' : 'focus:bg-[#1E1E24]'
                      }`}
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Backup Frequency */}
        <div>
          <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>
            Backup Schedule Frequency
          </label>
          <Select.Root value={backupFrequency} onValueChange={setBackupFrequency}>
            <Select.Trigger
              className={`flex h-[46px] w-full items-center justify-between rounded-xl border px-3 text-left text-sm outline-none ${inputClass}`}
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-4 w-4 text-[#71717A]" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                side="bottom"
                align="start"
                sideOffset={6}
                avoidCollisions
                className={`z-[1000] w-[260px] overflow-hidden rounded-xl border shadow-lg ${selectContentClass}`}
              >
                <Select.Viewport className="p-1">
                  {[
                    { value: 'daily', label: 'Daily at 02:00' },
                    { value: 'weekly', label: 'Weekly (Every Sunday)' },
                    { value: 'monthly', label: 'Monthly First Day' },
                    { value: 'manual', label: 'Manual Backups Only' },
                  ].map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${
                        isLightTheme ? 'focus:bg-[#F4F4F5]' : 'focus:bg-[#1E1E24]'
                      }`}
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className={`mt-6 rounded-xl border p-4 ${dangerBg} ${dangerBorder}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className={`text-sm font-bold ${headingClass}`}>DANGER ZONE — CRITICAL OPTIONS</h3>
            <p className={`text-xs ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
              Resetting application parameters will erase configuration files. Database file remains untouched.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#DC2626]"
          >
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  )
}