import { useState } from 'react'
import { SystemStatusBanner } from '../components/backup/SystemStatusBanner'
import { BackupHistoryTable, BackupHistoryEntry } from '../components/backup/BackupHistoryTable'

interface BackupRestorePageProps {
  isLightTheme?: boolean
}

// Mock data – will be replaced with real data from the database
const mockHistory: BackupHistoryEntry[] = [
  {
    id: '1',
    timestamp: '2026-07-17T14:30:00Z',
    filename: 'dystomentum_backup_20260717_1430.tar.gz',
    storageLocation: 'Local Disk & Secure USB',
    fileSize: '4.8 MB',
    status: 'SUCCESS',
  },
  {
    id: '2',
    timestamp: '2026-07-16T02:00:00Z',
    filename: 'dystomentum_backup_20260716_0200.tar.gz',
    storageLocation: 'Local Disk Only',
    fileSize: '4.7 MB',
    status: 'SUCCESS',
  },
  {
    id: '3',
    timestamp: '2026-07-15T14:30:00Z',
    filename: 'dystomentum_backup_20260715_1430.tar.gz',
    storageLocation: 'Local Disk & Secure USB',
    fileSize: '4.7 MB',
    status: 'FAILED',
  },
  {
    id: '4',
    timestamp: '2026-07-14T02:00:00Z',
    filename: 'dystomentum_backup_20260714_0200.tar.gz',
    storageLocation: 'Local Disk Only',
    fileSize: '4.6 MB',
    status: 'SUCCESS',
  },
]

export function BackupRestorePage({ isLightTheme = false }: BackupRestorePageProps) {
  const [history, setHistory] = useState(mockHistory)

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  const handleBackupNow = () => {
    // In real app, trigger backup process via IPC
    alert('Backup process started. This would create a new archive.')
  }

  const handleRestore = () => {
    // In real app, open restore dialog
    alert('Restore dialog would open. Choose which backup to restore.')
  }

  const handleRestoreEntry = (id: string) => {
    // Confirm and restore specific backup
    if (window.confirm(`Restore backup with ID ${id}? This will overwrite current database.`)) {
      alert(`Restoring backup ${id}...`)
    }
  }

  const handleDeleteEntry = (id: string) => {
    if (window.confirm(`Delete backup archive ${id}? This action is irreversible.`)) {
      setHistory((prev) => prev.filter((item) => item.id !== id))
      alert(`Backup ${id} deleted.`)
    }
  }

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      {/* Page Header */}
      <header>
        <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Backup &amp; Restore Manager</h1>
        <p className={`mt-1 text-sm ${mutedClass}`}>
          Maintain continuous state survival. Automated and localized snapshot systems.
        </p>
      </header>

      {/* System Status Banner */}
      <SystemStatusBanner
        dbPath="/Users/alex/Library/Application Support/Dystomentum/ledger.db"
        backupTarget="/Users/alex/Backups/Dystomentum/"
        lastBackup="Jul 17, 2026 at 14:30"
        nextScheduled="Jul 18, 2026 at 02:00"
        totalSnapshots={24}
        onBackupNow={handleBackupNow}
        onRestore={handleRestore}
        isLightTheme={isLightTheme}
      />

      {/* History Table */}
      <BackupHistoryTable
        entries={history}
        onRestore={handleRestoreEntry}
        onDelete={handleDeleteEntry}
        isLightTheme={isLightTheme}
      />
    </div>
  )
}