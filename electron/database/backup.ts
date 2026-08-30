import fs from 'node:fs'
import path from 'node:path'
import { dialog } from 'electron'
import { commitDatabase, getDatabase, getDatabasePath, resetDatabaseConnection } from './connection'
import { getSetupPreferences, saveSetupPreferences } from './initialize'

export interface BackupHistoryEntry {
  id: string
  timestamp: string
  filename: string
  storageLocation: string
  fileSize: string
  status: 'SUCCESS' | 'FAILED'
  path: string
  exists: boolean
}

export interface BackupStatus {
  dbPath: string
  backupTarget: string
  lastBackup: string
  nextScheduled: string
  totalSnapshots: number
  isBackupPathReady: boolean
}

function firstRow(result: ReturnType<Awaited<ReturnType<typeof getDatabase>>['exec']>): unknown[] | undefined {
  return result[0]?.values[0]
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function timestampForFilename(): string {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '_')
}

function normalizeBackupDirectory(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new Error('Backup path is required.')
  return path.parse(trimmed).ext ? path.dirname(trimmed) : trimmed
}

function ensureBackupSchema(db: Awaited<ReturnType<typeof getDatabase>>): boolean {
  let changed = false
  db.run(`
    CREATE TABLE IF NOT EXISTS Backup_History (
      Backup_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      File_Name TEXT NOT NULL,
      File_Path TEXT NOT NULL,
      Backup_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Status TEXT NOT NULL CHECK (Status IN ('Success', 'Failure'))
    )
  `)

  const columns = db.exec('PRAGMA table_info(Backup_History)')[0]?.values ?? []
  if (!columns.some((column) => column[1] === 'File_Size')) {
    db.run('ALTER TABLE Backup_History ADD COLUMN File_Size INTEGER NOT NULL DEFAULT 0')
    changed = true
  }
  if (!columns.some((column) => column[1] === 'Verified_At')) {
    db.run('ALTER TABLE Backup_History ADD COLUMN Verified_At DATETIME NULL')
    changed = true
  }
  if (!columns.some((column) => column[1] === 'Exists_On_Disk')) {
    db.run('ALTER TABLE Backup_History ADD COLUMN Exists_On_Disk BOOLEAN NOT NULL DEFAULT TRUE')
    changed = true
  }

  return changed
}

async function getBackupDirectory(): Promise<string> {
  const preferences = await getSetupPreferences()
  const backupPath = preferences?.backupPath
  if (!backupPath) throw new Error('Backup path is not configured.')
  return normalizeBackupDirectory(backupPath)
}

async function verifyBackupInventory(db: Awaited<ReturnType<typeof getDatabase>>): Promise<void> {
  ensureBackupSchema(db)
  const result = db.exec('SELECT Backup_ID, File_Path, Status FROM Backup_History')[0]
  let changed = false

  for (const row of result?.values ?? []) {
    const id = Number(row[0])
    const filePath = String(row[1])
    const exists = fs.existsSync(filePath)
    const status = exists ? String(row[2]) : 'Failure'
    const size = exists ? fs.statSync(filePath).size : 0
    db.run(
      'UPDATE Backup_History SET Status = ?, File_Size = ?, Exists_On_Disk = ?, Verified_At = CURRENT_TIMESTAMP WHERE Backup_ID = ?',
      [status, size, exists ? 1 : 0, id],
    )
    changed = true
  }

  if (changed) await commitDatabase(db)
}

async function insertBackupHistory(db: Awaited<ReturnType<typeof getDatabase>>, filePath: string, status: 'Success' | 'Failure'): Promise<void> {
  const exists = fs.existsSync(filePath)
  const size = exists ? fs.statSync(filePath).size : 0
  ensureBackupSchema(db)
  db.run(
    'INSERT INTO Backup_History (File_Name, File_Path, Backup_Date, Status, File_Size, Verified_At, Exists_On_Disk) VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP, ?)',
    [path.basename(filePath), filePath, status, size, exists ? 1 : 0],
  )
  await commitDatabase(db)
}

function getNextScheduled(lastBackupIso: string, frequency: string): string {
  if (!lastBackupIso || frequency === 'Manual') return 'Manual only'
  const last = new Date(lastBackupIso)
  if (Number.isNaN(last.getTime())) return 'Not scheduled'

  const next = new Date(last)
  if (frequency === 'Weekly') next.setDate(next.getDate() + 7)
  else if (frequency === 'Monthly') next.setMonth(next.getMonth() + 1)
  else next.setDate(next.getDate() + 1)
  next.setHours(2, 0, 0, 0)
  return next.toLocaleString()
}

function isBackupDue(lastBackupIso: string | undefined, frequency: string): boolean {
  if (frequency === 'Manual') return false
  if (!lastBackupIso) return true

  const last = new Date(lastBackupIso)
  if (Number.isNaN(last.getTime())) return true

  const next = new Date(last)
  if (frequency === 'Weekly') next.setDate(next.getDate() + 7)
  else if (frequency === 'Monthly') next.setMonth(next.getMonth() + 1)
  else next.setDate(next.getDate() + 1)

  return Date.now() >= next.getTime()
}

export async function selectBackupDirectory(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    title: 'Choose backup folder',
    properties: ['openDirectory', 'createDirectory'],
  })
  return result.canceled ? null : result.filePaths[0]
}

export async function createBackupNow(): Promise<BackupHistoryEntry> {
  const db = await getDatabase()
  ensureBackupSchema(db)
  await commitDatabase(db)

  const backupDirectory = await getBackupDirectory()
  const filePath = path.join(backupDirectory, `dystomentum_backup_${timestampForFilename()}.db`)

  try {
    fs.mkdirSync(backupDirectory, { recursive: true })
    fs.copyFileSync(getDatabasePath(), filePath)
    await insertBackupHistory(db, filePath, 'Success')
  } catch (error) {
    await insertBackupHistory(db, filePath, 'Failure')
    throw error
  }

  const row = firstRow(db.exec('SELECT Backup_ID FROM Backup_History WHERE rowid = last_insert_rowid()'))
  return (await listBackupHistory()).find((item) => item.id === String(row?.[0])) ?? (await listBackupHistory())[0]
}

export async function listBackupHistory(): Promise<BackupHistoryEntry[]> {
  const db = await getDatabase()
  if (ensureBackupSchema(db)) await commitDatabase(db)
  await verifyBackupInventory(db)

  const result = db.exec(`
    SELECT Backup_ID, Backup_Date, File_Name, File_Path, File_Size, Status, Exists_On_Disk
    FROM Backup_History
    ORDER BY datetime(Backup_Date) DESC, Backup_ID DESC
    LIMIT 50
  `)[0]

  return (result?.values ?? []).map((row) => ({
    id: String(row[0]),
    timestamp: new Date(String(row[1])).toISOString(),
    filename: String(row[2]),
    path: String(row[3]),
    storageLocation: path.dirname(String(row[3])),
    fileSize: formatBytes(Number(row[4])),
    status: String(row[5]) === 'Success' && Boolean(row[6]) ? 'SUCCESS' : 'FAILED',
    exists: Boolean(row[6]),
  }))
}

export async function getBackupStatus(): Promise<BackupStatus> {
  const db = await getDatabase()
  if (ensureBackupSchema(db)) await commitDatabase(db)
  await verifyBackupInventory(db)

  const preferences = await getSetupPreferences()
  const backupTarget = normalizeBackupDirectory(preferences?.backupPath ?? '')
  const last = firstRow(db.exec(`
    SELECT Backup_Date
    FROM Backup_History
    WHERE Status = 'Success' AND Exists_On_Disk = 1
    ORDER BY datetime(Backup_Date) DESC, Backup_ID DESC
    LIMIT 1
  `))
  const total = firstRow(db.exec("SELECT COUNT(*) FROM Backup_History WHERE Status = 'Success' AND Exists_On_Disk = 1"))

  return {
    dbPath: getDatabasePath(),
    backupTarget,
    lastBackup: last ? new Date(String(last[0])).toLocaleString() : 'Never',
    nextScheduled: getNextScheduled(last ? String(last[0]) : '', preferences?.frequency ?? 'Daily'),
    totalSnapshots: Number(total?.[0] ?? 0),
    isBackupPathReady: fs.existsSync(backupTarget),
  }
}

export async function deleteBackup(idValue: unknown): Promise<boolean> {
  const id = Number(idValue)
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('A valid backup ID is required.')

  const db = await getDatabase()
  ensureBackupSchema(db)
  const row = firstRow(db.exec('SELECT File_Path FROM Backup_History WHERE Backup_ID = ?', [id]))
  if (!row) throw new Error('Backup not found.')

  const filePath = String(row[0])
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  db.run('DELETE FROM Backup_History WHERE Backup_ID = ?', [id])
  await commitDatabase(db)
  return true
}

export async function restoreBackup(idValue?: unknown): Promise<boolean> {
  const db = await getDatabase()
  ensureBackupSchema(db)

  let filePath = ''
  if (idValue !== undefined && idValue !== null && idValue !== '') {
    const id = Number(idValue)
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('A valid backup ID is required.')
    const row = firstRow(db.exec('SELECT File_Path FROM Backup_History WHERE Backup_ID = ?', [id]))
    if (!row) throw new Error('Backup not found.')
    filePath = String(row[0])
  } else {
    const result = await dialog.showOpenDialog({
      title: 'Choose Dystomentum backup database',
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db'] }],
    })
    if (result.canceled) return false
    filePath = result.filePaths[0]
  }

  if (!fs.existsSync(filePath)) throw new Error('Backup file does not exist.')

  await commitDatabase(db)
  const databasePath = getDatabasePath()
  const restoreCheckpoint = `${databasePath}.before-restore-${Date.now()}`
  fs.copyFileSync(databasePath, restoreCheckpoint)
  fs.copyFileSync(filePath, databasePath)
  await resetDatabaseConnection()
  return true
}

export async function runBackupIntegrityJob(): Promise<BackupStatus> {
  const preferences = await getSetupPreferences()
  if (!preferences?.backupPath) return getBackupStatus()

  const normalizedBackupPath = normalizeBackupDirectory(preferences.backupPath)
  await saveSetupPreferences({ backupPath: normalizedBackupPath })

  if (preferences.automaticBackups && preferences.frequency !== 'Manual') {
    const db = await getDatabase()
    if (ensureBackupSchema(db)) await commitDatabase(db)
    await verifyBackupInventory(db)
    const last = firstRow(db.exec(`
      SELECT Backup_Date
      FROM Backup_History
      WHERE Status = 'Success' AND Exists_On_Disk = 1
      ORDER BY datetime(Backup_Date) DESC, Backup_ID DESC
      LIMIT 1
    `))

    if (isBackupDue(last ? String(last[0]) : undefined, preferences.frequency)) {
      await createBackupNow()
    }
  }

  return getBackupStatus()
}
