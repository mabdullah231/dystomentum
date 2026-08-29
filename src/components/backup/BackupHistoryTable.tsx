import { useState } from 'react'
import { StatusBadge, BackupStatus } from './StatusBadge'
import { cn } from '../../utils/cn'

export interface BackupHistoryEntry {
  id: string
  timestamp: string // ISO string
  filename: string
  storageLocation: string
  fileSize: string // e.g., "4.8 MB"
  status: BackupStatus
}

interface BackupHistoryTableProps {
  entries: BackupHistoryEntry[]
  onRestore: (id: string) => void
  onDelete: (id: string) => void
  isLightTheme: boolean
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

export function BackupHistoryTable({ entries, onRestore, onDelete, isLightTheme }: BackupHistoryTableProps) {
  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const headerBg = isLightTheme ? 'bg-[#F4F4F5]' : 'bg-[#121215]'

  return (
    <div className={`rounded-[12px] border p-5 ${panelClass}`}>
      <h2 className={`text-[16px] font-bold ${headingClass}`}>Snapshot Archive History</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className={`${headerBg} text-[10px] font-bold uppercase tracking-[0.14em] text-[#71717A]`}>
              <th className="px-3 py-3">Date &amp; Time</th>
              <th className="px-3 py-3">Archive Filename</th>
              <th className="px-3 py-3">Stored Location</th>
              <th className="px-3 py-3">File Size</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-3 py-6 text-center text-sm ${mutedClass}`}>
                  No backup archives found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-t border-[#27272A]">
                  <td className={`px-3 py-3 font-mono text-sm ${headingClass}`}>
                    {formatTimestamp(entry.timestamp)}
                  </td>
                  <td className={`px-3 py-3 font-mono text-sm font-bold ${headingClass}`}>
                    {entry.filename}
                  </td>
                  <td className={`px-3 py-3 text-sm ${mutedClass}`}>{entry.storageLocation}</td>
                  <td className={`px-3 py-3 font-mono text-sm ${headingClass}`}>{entry.fileSize}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={entry.status} isLightTheme={isLightTheme} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onRestore(entry.id)}
                        className={`text-sm font-medium underline underline-offset-2 ${
                          isLightTheme ? 'text-[#18181B] hover:text-[#52525B]' : 'text-white hover:text-[#A1A1AA]'
                        }`}
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        className="text-sm font-medium text-[#EF4444] underline underline-offset-2 hover:text-[#F87171]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}