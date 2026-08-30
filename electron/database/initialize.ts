import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { commitDatabase, getDatabase, getDatabasePath } from './connection'

export interface SetupPreferences {
  username: string
  appName?: string
  currency: string
  theme: string
  backupPath: string
  automaticBackups: boolean
  frequency: string
  firstLaunchCompleted?: boolean
}

const DEFAULT_BACKUP_LOCATION = path.join(app.getPath('documents'), 'Dystomentum', 'Backups')
const DEFAULT_DATABASE_LOCATION = getDatabasePath()

const DEFAULT_APP_SETTINGS: Record<string, string> = {
  username: 'Operator',
  application_name: 'Dystomentum Personal Ledger',
  currency: 'USD',
  theme: 'Dark',
  backup_location: DEFAULT_BACKUP_LOCATION,
  database_location: DEFAULT_DATABASE_LOCATION,
  automatic_backups: 'true',
  backup_frequency: 'Daily',
  first_launch_completed: 'false',
}

function ensureDirectoryForFile(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function addColumnIfMissing(db: Awaited<ReturnType<typeof getDatabase>>, table: string, column: string, definition: string): void {
  const existingColumns = db.exec(`PRAGMA table_info(${table})`)[0]?.values ?? []
  if (existingColumns.some((values) => values[1] === column)) return
  db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
}

function applyCatalogMigrations(db: Awaited<ReturnType<typeof getDatabase>>): void {
  addColumnIfMissing(db, 'Categories', 'Updated_At', 'DATETIME NULL')
  addColumnIfMissing(db, 'Payment_Methods', 'Icon', 'TEXT NULL')
  addColumnIfMissing(db, 'Payment_Methods', 'Color', 'TEXT NULL')
  addColumnIfMissing(db, 'Payment_Methods', 'Updated_At', 'DATETIME NULL')
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_type ON Categories(Name, Type)')
}

async function upsertAppSetting(db: Awaited<ReturnType<typeof getDatabase>>, key: string, value: string): Promise<void> {
  db.run(
    `
      INSERT INTO Application_Settings (Setting_Key, Setting_Value)
      VALUES (?, ?)
      ON CONFLICT(Setting_Key) DO UPDATE SET Setting_Value = excluded.Setting_Value
    `,
    [key, value],
  )
}

async function ensureDefaultCategoriesAndPaymentMethods(db: Awaited<ReturnType<typeof getDatabase>>): Promise<void> {
  const categoryCount = db.exec('SELECT COUNT(*) AS count FROM Categories')[0]?.values[0]?.[0] ?? 0
  if (Number(categoryCount) === 0) {
    const defaultCategories = [
      ['Salary', 'Income', 'wallet', '#16a34a', 1],
      ['Freelance', 'Income', 'briefcase', '#22c55e', 1],
      ['Investments', 'Income', 'trending-up', '#a3e635', 1],
      ['Housing', 'Expense', 'home', '#f59e0b', 1],
      ['Utilities', 'Expense', 'zap', '#f97316', 1],
      ['Food', 'Expense', 'utensils', '#ef4444', 1],
      ['Transport', 'Expense', 'car', '#3b82f6', 1],
      ['Entertainment', 'Expense', 'tv', '#8b5cf6', 1],
    ] as const

    for (const [name, type, icon, color, isDefault] of defaultCategories) {
      db.run(
        `
          INSERT INTO Categories (Name, Type, Icon, Color, Is_Default, Created_At)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        [name, type, icon, color, Number(isDefault)],
      )
    }
  }

  const paymentMethodCount = db.exec('SELECT COUNT(*) AS count FROM Payment_Methods')[0]?.values[0]?.[0] ?? 0
  if (Number(paymentMethodCount) === 0) {
    const defaultPaymentMethods = [
      ['Cash', 'wallet', '#22c55e'],
      ['Credit Card', 'credit-card', '#8b5cf6'],
      ['Bank Transfer', 'landmark', '#3b82f6'],
    ] as const
    for (const [method, icon, color] of defaultPaymentMethods) {
      db.run(
        `
          INSERT INTO Payment_Methods (Name, Icon, Color, Is_Default, Created_At)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        [method, icon, color, 1],
      )
    }
  }
}

async function migrateLegacySetupPreferences(db: Awaited<ReturnType<typeof getDatabase>>): Promise<void> {
  const legacyTableExists = db.exec(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'setup_preferences' LIMIT 1",
  )

  if (legacyTableExists.length === 0) return

  const legacyRow = db.exec(`
    SELECT username, currency, theme, backup_path, automatic_backups, backup_frequency, completed_at
    FROM setup_preferences
    WHERE id = 1
    LIMIT 1
  `)[0]?.values[0]

  if (!legacyRow) return

  const [username, currency, theme, backupPath, automaticBackups, backupFrequency, completedAt] = legacyRow as unknown[]

  if (typeof username === 'string') await upsertAppSetting(db, 'username', username)
  if (typeof currency === 'string') await upsertAppSetting(db, 'currency', currency)
  if (typeof theme === 'string') await upsertAppSetting(db, 'theme', theme)
  if (typeof backupPath === 'string') await upsertAppSetting(db, 'backup_location', backupPath)
  if (typeof automaticBackups === 'number') await upsertAppSetting(db, 'automatic_backups', automaticBackups === 1 ? 'true' : 'false')
  if (typeof backupFrequency === 'string') await upsertAppSetting(db, 'backup_frequency', backupFrequency)
  if (typeof completedAt === 'string') await upsertAppSetting(db, 'first_launch_completed', completedAt === 'true' ? 'true' : 'false')
}

export async function getSetupPreferences(): Promise<SetupPreferences | null> {
  if (!fs.existsSync(getDatabasePath())) return null

  const db = await getDatabase()
  const rows = db.exec(
    `
      SELECT Setting_Key, Setting_Value
      FROM Application_Settings
    `,
  )

  const settings: Record<string, string> = {}
  for (const row of rows) {
    for (const values of row.values) {
      const key = values[0]
      const value = values[1]
      if (typeof key === 'string' && typeof value === 'string') {
        settings[key] = value
      }
    }
  }

  const userName = settings.username ?? DEFAULT_APP_SETTINGS.username
  const appName = settings.application_name ?? DEFAULT_APP_SETTINGS.application_name
  const currency = settings.currency ?? DEFAULT_APP_SETTINGS.currency
  const theme = settings.theme ?? DEFAULT_APP_SETTINGS.theme
  const backupPath = settings.backup_location ?? DEFAULT_APP_SETTINGS.backup_location
  const firstLaunchCompleted = settings.first_launch_completed === 'true'
  const automaticBackups = settings.automatic_backups === 'true'
  const frequency = settings.backup_frequency ?? DEFAULT_APP_SETTINGS.backup_frequency

  if (!userName && !currency && !theme && !backupPath) {
    return null
  }

  return {
    username: userName,
    appName,
    currency,
    theme,
    backupPath,
    automaticBackups,
    frequency,
    firstLaunchCompleted,
  }
}

export async function saveSetupPreferences(partialPreferences: Partial<SetupPreferences>): Promise<SetupPreferences> {
  const currentPreferences = (await getSetupPreferences()) ?? {
    username: DEFAULT_APP_SETTINGS.username,
    appName: DEFAULT_APP_SETTINGS.application_name,
    currency: DEFAULT_APP_SETTINGS.currency,
    theme: DEFAULT_APP_SETTINGS.theme,
    backupPath: DEFAULT_APP_SETTINGS.backup_location,
    automaticBackups: DEFAULT_APP_SETTINGS.automatic_backups === 'true',
    frequency: DEFAULT_APP_SETTINGS.backup_frequency,
    firstLaunchCompleted: DEFAULT_APP_SETTINGS.first_launch_completed === 'true',
  }

  const mergedPreferences: SetupPreferences = {
    username: partialPreferences.username ?? currentPreferences.username,
    appName: partialPreferences.appName ?? currentPreferences.appName,
    currency: partialPreferences.currency ?? currentPreferences.currency,
    theme: partialPreferences.theme ?? currentPreferences.theme,
    backupPath: partialPreferences.backupPath ?? currentPreferences.backupPath,
    automaticBackups: partialPreferences.automaticBackups ?? currentPreferences.automaticBackups,
    frequency: partialPreferences.frequency ?? currentPreferences.frequency,
    firstLaunchCompleted: partialPreferences.firstLaunchCompleted ?? currentPreferences.firstLaunchCompleted,
  }

  const db = await getDatabase()
  const appSettings: Array<[string, string]> = [
    ['username', mergedPreferences.username],
    ['application_name', mergedPreferences.appName ?? DEFAULT_APP_SETTINGS.application_name],
    ['currency', mergedPreferences.currency],
    ['theme', mergedPreferences.theme],
    ['backup_location', mergedPreferences.backupPath],
    ['database_location', DEFAULT_DATABASE_LOCATION],
    ['automatic_backups', String(mergedPreferences.automaticBackups)],
    ['backup_frequency', mergedPreferences.frequency],
    ['first_launch_completed', String(Boolean(mergedPreferences.firstLaunchCompleted ?? true))],
  ]

  for (const [key, value] of appSettings) {
    await upsertAppSetting(db, key, value)
  }

  await commitDatabase(db)

  return mergedPreferences
}

export async function resetSetupPreferences(): Promise<SetupPreferences> {
  const defaults: SetupPreferences = {
    username: DEFAULT_APP_SETTINGS.username,
    appName: DEFAULT_APP_SETTINGS.application_name,
    currency: DEFAULT_APP_SETTINGS.currency,
    theme: DEFAULT_APP_SETTINGS.theme,
    backupPath: DEFAULT_APP_SETTINGS.backup_location,
    automaticBackups: DEFAULT_APP_SETTINGS.automatic_backups === 'true',
    frequency: DEFAULT_APP_SETTINGS.backup_frequency,
    firstLaunchCompleted: true,
  }

  return saveSetupPreferences(defaults)
}

export async function initializeDatabase(preferences: SetupPreferences): Promise<void> {
  const db = await getDatabase()
  db.run('PRAGMA foreign_keys = ON;')

  db.run(`
    CREATE TABLE IF NOT EXISTS Application_Settings (
      Setting_Key TEXT PRIMARY KEY,
      Setting_Value TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS Categories (
      Category_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Type TEXT NOT NULL CHECK (Type IN ('Income', 'Expense')),
      Icon TEXT NULL,
      Color TEXT NULL,
      Is_Default BOOLEAN NOT NULL DEFAULT FALSE,
      Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS Payment_Methods (
      Payment_Method_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT UNIQUE NOT NULL,
      Icon TEXT NULL,
      Color TEXT NULL,
      Is_Default BOOLEAN NOT NULL DEFAULT FALSE,
      Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Updated_At DATETIME NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS Income (
      Income_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Date DATE NOT NULL,
      Title TEXT NOT NULL,
      Amount DECIMAL NOT NULL,
      Category_ID INTEGER,
      Notes TEXT NULL,
      Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Updated_At DATETIME NULL,
      FOREIGN KEY (Category_ID) REFERENCES Categories(Category_ID)
    )
  `)

  applyCatalogMigrations(db)

  db.run(`
    CREATE TABLE IF NOT EXISTS Expense (
      Expense_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Date DATE NOT NULL,
      Title TEXT NOT NULL,
      Amount DECIMAL NOT NULL,
      Category_ID INTEGER,
      Payment_Method_ID INTEGER,
      Notes TEXT NULL,
      Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Updated_At DATETIME NULL,
      FOREIGN KEY (Category_ID) REFERENCES Categories(Category_ID),
      FOREIGN KEY (Payment_Method_ID) REFERENCES Payment_Methods(Payment_Method_ID)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS Backup_History (
      Backup_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      File_Name TEXT NOT NULL,
      File_Path TEXT NOT NULL,
      Backup_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Status TEXT NOT NULL CHECK (Status IN ('Success', 'Failure'))
    )
  `)

  const appSettings: Array<[string, string]> = [
    ['username', preferences.username],
    ['application_name', preferences.appName ?? DEFAULT_APP_SETTINGS.application_name],
    ['currency', preferences.currency],
    ['theme', preferences.theme],
    ['backup_location', preferences.backupPath],
    ['database_location', DEFAULT_DATABASE_LOCATION],
    ['automatic_backups', String(preferences.automaticBackups)],
    ['backup_frequency', preferences.frequency],
    ['first_launch_completed', String(Boolean(preferences.firstLaunchCompleted ?? true))],
  ]

  for (const [key, value] of appSettings) {
    await upsertAppSetting(db, key, value)
  }

  const settingsCount = db.exec('SELECT COUNT(*) AS count FROM Application_Settings')[0]?.values[0]?.[0] ?? 0
  if (Number(settingsCount) === 0) {
    for (const [key, value] of Object.entries(DEFAULT_APP_SETTINGS)) {
      await upsertAppSetting(db, key, value)
    }
  }

  await ensureDefaultCategoriesAndPaymentMethods(db)
  await migrateLegacySetupPreferences(db)

  ensureDirectoryForFile(DEFAULT_DATABASE_LOCATION)
  ensureDirectoryForFile(path.join(DEFAULT_BACKUP_LOCATION, 'placeholder.txt'))

  await commitDatabase(db)
}
