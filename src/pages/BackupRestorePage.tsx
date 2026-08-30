import { useEffect, useState } from 'react'
import { SystemStatusBanner } from '../components/backup/SystemStatusBanner'
import { BackupHistoryTable, BackupHistoryEntry } from '../components/backup/BackupHistoryTable'

interface BackupRestorePageProps {
  isLightTheme?: boolean
}

type BackupStatus = {
  dbPath: string
  backupTarget: string
  lastBackup: string
  nextScheduled: string
  totalSnapshots: number
}

const emptyStatus: BackupStatus = {
  dbPath: 'Loading...',
  backupTarget: 'Loading...',
  lastBackup: 'Never',
  nextScheduled: 'Not scheduled',
  totalSnapshots: 0,
}

export function BackupRestorePage({ isLightTheme = false }: BackupRestorePageProps) {
  const [history, setHistory] = useState<BackupHistoryEntry[]>([])
  const [backupStatus, setBackupStatus] = useState<BackupStatus>(emptyStatus)
  const [status, setStatus] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const statusClass = status.startsWith('Unable') ? 'text-red-400' : mutedClass

  const refresh = async () => {
    const [nextStatus, nextHistory] = await Promise.all([
      window.electronAPI.invoke('check-backup-status'),
      window.electronAPI.invoke('list-backups'),
    ])
    if (nextStatus && typeof nextStatus === 'object') setBackupStatus(nextStatus as BackupStatus)
    if (Array.isArray(nextHistory)) setHistory(nextHistory as BackupHistoryEntry[])
  }

  useEffect(() => {
    void refresh().catch(() => setStatus('Unable to load backup status.'))
  }, [])

  const handleBackupNow = async () => {
    setIsBusy(true)
    setStatus('')
    try {
      await window.electronAPI.invoke('create-backup')
      await refresh()
      setStatus('Backup snapshot created.')
    } catch {
      setStatus('Unable to create backup. Check the configured backup folder.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleRestore = async () => {
    if (!window.confirm('Restore a backup database? The current database file will be checkpointed first.')) return
    setIsBusy(true)
    setStatus('')
    try {
      const restored = await window.electronAPI.invoke('restore-backup')
      if (restored) {
        await refresh()
        setStatus('Backup restored. Restart the app if a page still shows old data.')
      }
    } catch {
      setStatus('Unable to restore selected backup.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleRestoreEntry = async (id: string) => {
    if (!window.confirm(`Restore backup with ID ${id}? The current database file will be checkpointed first.`)) return
    setIsBusy(true)
    setStatus('')
    try {
      await window.electronAPI.invoke('restore-backup', id)
      await refresh()
      setStatus('Backup restored. Restart the app if a page still shows old data.')
    } catch {
      setStatus('Unable to restore that backup.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm(`Delete backup archive ${id}? This removes the snapshot file from disk.`)) return
    setIsBusy(true)
    setStatus('')
    try {
      await window.electronAPI.invoke('delete-backup', id)
      await refresh()
      setStatus('Backup snapshot deleted.')
    } catch {
      setStatus('Unable to delete that backup.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      <header>
        <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Backup &amp; Restore Manager</h1>
        <p className={`mt-1 text-sm ${mutedClass}`}>
          Maintain continuous state survival. Automated and localized snapshot systems.
        </p>
      </header>

      <SystemStatusBanner
        dbPath={backupStatus.dbPath}
        backupTarget={backupStatus.backupTarget}
        lastBackup={backupStatus.lastBackup}
        nextScheduled={backupStatus.nextScheduled}
        totalSnapshots={backupStatus.totalSnapshots}
        onBackupNow={() => void handleBackupNow()}
        onRestore={() => void handleRestore()}
        isLightTheme={isLightTheme}
      />

      <p role="status" className={`text-sm ${statusClass}`}>{isBusy ? 'Working on backup storage...' : status}</p>

      <BackupHistoryTable
        entries={history}
        onRestore={(id) => void handleRestoreEntry(id)}
        onDelete={(id) => void handleDeleteEntry(id)}
        isLightTheme={isLightTheme}
      />
    </div>
  )
}
