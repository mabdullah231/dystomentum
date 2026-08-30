import fs from 'node:fs'
import path from 'node:path'
import { shell } from 'electron'
import * as XLSX from 'xlsx'
import { commitDatabase, getDatabase, getDatabasePath } from './connection'

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'sqlite'

export interface ExportOptions {
  format: ExportFormat
  range: 'all' | 'date-range' | 'dashboard-filters'
  startDate: string | null
  endDate: string | null
  destinationPath: string
  includeIncome: boolean
  includeExpense: boolean
  includeNotes: boolean
  anonymizeValues: boolean
}

export interface ExportHistoryEntry {
  id: string
  format: string
  date: string
  size: string
  filename: string
  path: string
}

interface LedgerRow {
  Type: string
  ID: string
  Date: string
  Description: string
  Amount: number | string
  Category: string
  Payment_Method: string
  Notes?: string
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid export payload.')
  return value as Record<string, unknown>
}

function validateOptions(value: unknown): ExportOptions {
  const payload = requireRecord(value)
  const format = payload.format
  if (format !== 'csv' && format !== 'xlsx' && format !== 'json' && format !== 'sqlite') throw new Error('Unsupported export format.')

  const range = payload.range === 'date-range' || payload.range === 'dashboard-filters' ? payload.range : 'all'
  const startDate = typeof payload.startDate === 'string' && payload.startDate.trim() ? payload.startDate.trim() : null
  const endDate = typeof payload.endDate === 'string' && payload.endDate.trim() ? payload.endDate.trim() : null
  if (range === 'date-range') {
    if (!startDate || !endDate) throw new Error('Start and end dates are required for date range exports.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) throw new Error('Date range must use YYYY-MM-DD dates.')
    if (startDate > endDate) throw new Error('Start date cannot be after end date.')
  }

  const destinationPath = typeof payload.destinationPath === 'string' ? payload.destinationPath.trim() : ''
  if (!destinationPath) throw new Error('Destination folder is required.')

  return {
    format,
    range,
    startDate,
    endDate,
    destinationPath,
    includeIncome: payload.includeIncome !== false,
    includeExpense: payload.includeExpense !== false,
    includeNotes: payload.includeNotes !== false,
    anonymizeValues: payload.anonymizeValues === true,
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function timestampForFilename(): string {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '_')
}

function ensureExportSchema(db: Awaited<ReturnType<typeof getDatabase>>): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS Export_History (
      Export_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Format TEXT NOT NULL,
      File_Name TEXT NOT NULL,
      File_Path TEXT NOT NULL,
      File_Size INTEGER NOT NULL DEFAULT 0,
      Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

function normalizeDestinationFolder(destinationPath: string): string {
  const parsed = path.parse(destinationPath)
  if (parsed.ext) return path.dirname(destinationPath)
  return destinationPath
}

function dateClause(alias: string, options: ExportOptions): string {
  if (options.range !== 'date-range') return ''
  return `WHERE ${alias}.Date BETWEEN ? AND ?`
}

function getLedgerRows(db: Awaited<ReturnType<typeof getDatabase>>, options: ExportOptions): LedgerRow[] {
  const parts: string[] = []
  const params: string[] = []
  if (options.includeIncome) {
    parts.push(`
      SELECT
        'INCOME' AS Type,
        'INC-' || i.Income_ID AS ID,
        i.Date,
        i.Title AS Description,
        i.Amount,
        COALESCE(c.Name, 'Uncategorized') AS Category,
        '' AS Payment_Method,
        COALESCE(i.Notes, '') AS Notes
      FROM Income i
      LEFT JOIN Categories c ON c.Category_ID = i.Category_ID
      ${dateClause('i', options)}
    `)
    if (options.range === 'date-range' && options.startDate && options.endDate) params.push(options.startDate, options.endDate)
  }

  if (options.includeExpense) {
    parts.push(`
      SELECT
        'EXPENSE' AS Type,
        'EXP-' || e.Expense_ID AS ID,
        e.Date,
        e.Title AS Description,
        e.Amount,
        COALESCE(c.Name, 'Uncategorized') AS Category,
        COALESCE(pm.Name, 'Unspecified') AS Payment_Method,
        COALESCE(e.Notes, '') AS Notes
      FROM Expense e
      LEFT JOIN Categories c ON c.Category_ID = e.Category_ID
      LEFT JOIN Payment_Methods pm ON pm.Payment_Method_ID = e.Payment_Method_ID
      ${dateClause('e', options)}
    `)
    if (options.range === 'date-range' && options.startDate && options.endDate) params.push(options.startDate, options.endDate)
  }

  if (parts.length === 0) return []
  const result = db.exec(`${parts.join('\nUNION ALL\n')} ORDER BY Date DESC, ID DESC`, params)[0]
  return (result?.values ?? []).map((row) => {
    const amount = Number(row[4])
    return {
      Type: String(row[0]),
      ID: String(row[1]),
      Date: String(row[2]),
      Description: String(row[3]),
      Amount: options.anonymizeValues ? 'REDACTED' : amount,
      Category: String(row[5]),
      Payment_Method: String(row[6]),
      ...(options.includeNotes ? { Notes: String(row[7]) } : {}),
    }
  })
}

function csvEscape(value: unknown): string {
  const text = String(value ?? '')
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

function writeCsv(filePath: string, rows: LedgerRow[]): void {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Type', 'ID', 'Date', 'Description', 'Amount', 'Category', 'Payment_Method', 'Notes']
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header as keyof LedgerRow])).join(','))
  }
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
}

function writeJson(filePath: string, rows: LedgerRow[]): void {
  fs.writeFileSync(filePath, JSON.stringify({ exportedAt: new Date().toISOString(), records: rows }, null, 2), 'utf8')
}

function writeXlsx(filePath: string, rows: LedgerRow[]): void {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger')
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer
  fs.writeFileSync(filePath, buffer)
}

async function rememberExport(db: Awaited<ReturnType<typeof getDatabase>>, format: ExportFormat, filePath: string): Promise<ExportHistoryEntry> {
  const stats = fs.statSync(filePath)
  ensureExportSchema(db)
  db.run(
    'INSERT INTO Export_History (Format, File_Name, File_Path, File_Size) VALUES (?, ?, ?, ?)',
    [format.toUpperCase(), path.basename(filePath), filePath, stats.size],
  )
  const row = db.exec('SELECT Export_ID FROM Export_History WHERE rowid = last_insert_rowid()')[0]?.values[0]
  await commitDatabase(db)
  return {
    id: String(row?.[0] ?? ''),
    format: format.toUpperCase(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    size: formatBytes(stats.size),
    filename: path.basename(filePath),
    path: filePath,
  }
}

export async function listExportHistory(): Promise<ExportHistoryEntry[]> {
  const db = await getDatabase()
  ensureExportSchema(db)
  const result = db.exec(`
    SELECT Export_ID, Format, File_Name, File_Path, File_Size, Created_At
    FROM Export_History
    ORDER BY datetime(Created_At) DESC, Export_ID DESC
    LIMIT 20
  `)[0]

  return (result?.values ?? []).map((row) => ({
    id: String(row[0]),
    format: String(row[1]),
    filename: String(row[2]),
    path: String(row[3]),
    size: formatBytes(Number(row[4])),
    date: new Date(String(row[5])).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }))
}

export async function previewExport(optionsValue: unknown): Promise<{ recordCount: number; estimatedSize: string; suggestedFilename: string }> {
  const options = validateOptions(optionsValue)
  const db = await getDatabase()
  const rows = options.format === 'sqlite' ? [] : getLedgerRows(db, options)
  const extension = options.format === 'sqlite' ? 'db' : options.format
  const suggestedFilename = `dystomentum_ledger_${timestampForFilename()}.${extension}`
  const estimatedBytes = options.format === 'sqlite'
    ? fs.existsSync(getDatabasePath()) ? fs.statSync(getDatabasePath()).size : 0
    : Buffer.byteLength(JSON.stringify(rows), 'utf8')

  return { recordCount: options.format === 'sqlite' ? -1 : rows.length, estimatedSize: formatBytes(estimatedBytes), suggestedFilename }
}

export async function runExport(optionsValue: unknown): Promise<ExportHistoryEntry> {
  const options = validateOptions(optionsValue)
  const db = await getDatabase()
  await commitDatabase(db)

  const destinationFolder = normalizeDestinationFolder(options.destinationPath)
  fs.mkdirSync(destinationFolder, { recursive: true })
  const extension = options.format === 'sqlite' ? 'db' : options.format
  const filePath = path.join(destinationFolder, `dystomentum_ledger_${timestampForFilename()}.${extension}`)

  if (options.format === 'sqlite') {
    fs.copyFileSync(getDatabasePath(), filePath)
  } else {
    const rows = getLedgerRows(db, options)
    if (options.format === 'csv') writeCsv(filePath, rows)
    if (options.format === 'json') writeJson(filePath, rows)
    if (options.format === 'xlsx') writeXlsx(filePath, rows)
  }

  return rememberExport(db, options.format, filePath)
}

export async function openPathInShell(targetPath: unknown): Promise<boolean> {
  if (typeof targetPath !== 'string' || !targetPath.trim()) throw new Error('Path is required.')
  const normalizedPath = targetPath.trim()
  if (fs.existsSync(normalizedPath) && fs.statSync(normalizedPath).isFile()) {
    shell.showItemInFolder(normalizedPath)
    return true
  }

  const error = await shell.openPath(normalizedPath)
  if (error) throw new Error(error)
  return true
}
