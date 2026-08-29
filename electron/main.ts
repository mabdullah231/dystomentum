import { app, BrowserWindow, dialog, ipcMain, Tray } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let tray: Tray | undefined
let mainWindow: BrowserWindow | undefined
let currentThemeIsLight = false
const TITLE_BAR_HEIGHT = 40

function getIconPath(): string {
  return app.isPackaged
    ? path.join(__dirname, '../dist/branding/Icon.png')
    : path.join(process.cwd(), 'public', 'branding', 'Icon.png')
}

function applyWindowTheme(isLightTheme: boolean): void {
  if (!mainWindow) return

  currentThemeIsLight = isLightTheme
  mainWindow.setBackgroundColor(isLightTheme ? '#F4F4F5' : '#0A0A0B')
  mainWindow.setTitleBarOverlay({
    color: isLightTheme ? '#F4F4F5' : '#0A0A0B',
    symbolColor: isLightTheme ? '#18181B' : '#E8E8EC',
    height: TITLE_BAR_HEIGHT,
  })
}

function setTopBarOverlay(visible: boolean): void {
  if (!mainWindow) return

  if (visible) {
    mainWindow.setTitleBarOverlay({
      color: '#00000000',
      symbolColor: '#00000000',
      height: TITLE_BAR_HEIGHT,
    })
    return
  }

  applyWindowTheme(currentThemeIsLight)
}

function createWindow(): void {
  const win = new BrowserWindow({
    backgroundColor: '#0A0A0B',
    icon: getIconPath(),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0A0A0B',
      symbolColor: '#E8E8EC',
      height: TITLE_BAR_HEIGHT,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow = win
  applyWindowTheme(false)

  win.maximize()
  win.setMenuBarVisibility(false)

  tray ??= new Tray(getIconPath())
  tray.setToolTip('Dystomentum')

  if (process.env.VITE_DEV_SERVER_URL) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    void win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('select-backup-location', async () => {
  const result = await dialog.showSaveDialog({
    title: 'Choose backup vault location',
    defaultPath: 'backup_vault.db',
    filters: [{ name: 'Database', extensions: ['db'] }],
  })
  return result.canceled ? null : result.filePath
})

ipcMain.handle('get-database-location', async () => {
  const { getDatabasePath } = await import('./database/connection')
  return getDatabasePath()
})

ipcMain.handle('get-setup-preferences', async () => {
  const { getSetupPreferences } = await import('./database/initialize')
  return getSetupPreferences()
})

ipcMain.handle('initialize-database', async (_event, preferences) => {
  const { initializeDatabase } = await import('./database/initialize')
  await initializeDatabase(preferences)
  return { initialized: true }
})

ipcMain.handle('save-setup-preferences', async (_event, preferences) => {
  const { saveSetupPreferences } = await import('./database/initialize')
  return saveSetupPreferences(preferences)
})

ipcMain.handle('get-transactions', async () => {
  const { getDatabase } = await import('./database/connection')
  const db = await getDatabase()
  const result = db.exec(`
    SELECT
      'INCOME' AS Type,
      'INC-' || Income_ID AS ID,
      Date,
      Title,
      Amount,
      COALESCE(Categories.Name, 'Uncategorized') AS Category,
      '—' AS Method,
      COALESCE(Notes, '') AS Notes
    FROM Income
    LEFT JOIN Categories ON Categories.Category_ID = Income.Category_ID

    UNION ALL

    SELECT
      'EXPENSE' AS Type,
      'EXP-' || Expense_ID AS ID,
      Date,
      Title,
      Amount,
      COALESCE(Categories.Name, 'Uncategorized') AS Category,
      COALESCE(Payment_Methods.Name, 'Unspecified') AS Method,
      COALESCE(Notes, '') AS Notes
    FROM Expense
    LEFT JOIN Categories ON Categories.Category_ID = Expense.Category_ID
    LEFT JOIN Payment_Methods ON Payment_Methods.Payment_Method_ID = Expense.Payment_Method_ID

    ORDER BY Date DESC, ID DESC
  `)[0]

  if (!result) return []

  return result.values.map((row) => ({
    type: String(row[0]),
    id: String(row[1]),
    date: String(row[2]),
    description: String(row[3]),
    amount: Number(row[4]),
    category: String(row[5]),
    method: String(row[6]),
    notes: String(row[7]),
  }))
})

ipcMain.handle('set-window-theme', async (_event, isLightTheme: boolean) => {
  applyWindowTheme(Boolean(isLightTheme))
  return true
})

ipcMain.handle('set-window-overlay', async (_event, visible: boolean) => {
  setTopBarOverlay(Boolean(visible))
  return true
})

app.whenReady().then(() => {
  try {
    createWindow()
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error)
    fs.writeFileSync(path.join(app.getPath('userData'), 'startup-error.log'), message)
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
