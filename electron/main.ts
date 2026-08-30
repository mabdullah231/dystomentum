import { app, BrowserWindow, dialog, ipcMain, Menu, Tray } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let tray: Tray | undefined
let mainWindow: BrowserWindow | undefined
let currentThemeIsLight = false
const TITLE_BAR_HEIGHT = 40
const APP_NAME = 'Dystomentum'
const APP_ID = 'com.dystomentum.app'

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

function applyAppIdentity(win: BrowserWindow): void {
  win.setTitle(APP_NAME)
  win.setIcon(getIconPath())
  win.on('page-title-updated', (event) => {
    event.preventDefault()
    win.setTitle(APP_NAME)
  })
  win.webContents.on('before-input-event', (event, input) => {
    const key = input.key.toLowerCase()
    if (key === 'f5' || ((input.control || input.meta) && key === 'r')) {
      event.preventDefault()
    }
  })
}

function createWindow(): void {
  const win = new BrowserWindow({
    title: APP_NAME,
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
  applyAppIdentity(win)
  applyWindowTheme(false)

  win.maximize()
  win.setMenuBarVisibility(false)

  tray ??= new Tray(getIconPath())
  tray.setToolTip(APP_NAME)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: APP_NAME, enabled: false },
    { type: 'separator' },
    { label: 'Open Dystomentum', click: () => { win.show(); win.focus() } },
    { label: 'Quit', click: () => app.quit() },
  ]))

  if (process.env.VITE_DEV_SERVER_URL) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    void win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('select-backup-location', async () => {
  const { selectBackupDirectory } = await import('./database/backup')
  return selectBackupDirectory()
})

ipcMain.handle('select-export-folder', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Choose export folder',
    properties: ['openDirectory', 'createDirectory'],
  })
  return result.canceled ? null : result.filePaths[0]
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

ipcMain.handle('reset-setup-preferences', async () => {
  const { resetSetupPreferences } = await import('./database/initialize')
  return resetSetupPreferences()
})

ipcMain.handle('get-backup-status', async () => {
  const { getBackupStatus } = await import('./database/backup')
  return getBackupStatus()
})

ipcMain.handle('list-backups', async () => {
  const { listBackupHistory } = await import('./database/backup')
  return listBackupHistory()
})

ipcMain.handle('create-backup', async () => {
  const { createBackupNow } = await import('./database/backup')
  return createBackupNow()
})

ipcMain.handle('restore-backup', async (_event, id?: unknown) => {
  const { restoreBackup } = await import('./database/backup')
  return restoreBackup(id)
})

ipcMain.handle('delete-backup', async (_event, id: unknown) => {
  const { deleteBackup } = await import('./database/backup')
  return deleteBackup(id)
})

ipcMain.handle('check-backup-status', async () => {
  const { runBackupIntegrityJob } = await import('./database/backup')
  return runBackupIntegrityJob()
})

ipcMain.handle('list-export-history', async () => {
  const { listExportHistory } = await import('./database/exporting')
  return listExportHistory()
})

ipcMain.handle('preview-export', async (_event, options: unknown) => {
  const { previewExport } = await import('./database/exporting')
  return previewExport(options)
})

ipcMain.handle('run-export', async (_event, options: unknown) => {
  const { runExport } = await import('./database/exporting')
  return runExport(options)
})

ipcMain.handle('open-path', async (_event, targetPath: unknown) => {
  const { openPathInShell } = await import('./database/exporting')
  return openPathInShell(targetPath)
})

ipcMain.handle('list-categories', async (_event, type?: unknown) => {
  const { listCategories } = await import('./database/catalog')
  return listCategories(type)
})

ipcMain.handle('create-category', async (_event, type: unknown, category: unknown) => {
  const { createCategory } = await import('./database/catalog')
  return createCategory(type, category)
})

ipcMain.handle('update-category', async (_event, id: unknown, category: unknown) => {
  const { updateCategory } = await import('./database/catalog')
  return updateCategory(id, category)
})

ipcMain.handle('delete-category', async (_event, id: unknown) => {
  const { deleteCategory } = await import('./database/catalog')
  await deleteCategory(id)
  return true
})

ipcMain.handle('list-payment-methods', async () => {
  const { listPaymentMethods } = await import('./database/catalog')
  return listPaymentMethods()
})

ipcMain.handle('create-payment-method', async (_event, paymentMethod: unknown) => {
  const { createPaymentMethod } = await import('./database/catalog')
  return createPaymentMethod(paymentMethod)
})

ipcMain.handle('update-payment-method', async (_event, id: unknown, paymentMethod: unknown) => {
  const { updatePaymentMethod } = await import('./database/catalog')
  return updatePaymentMethod(id, paymentMethod)
})

ipcMain.handle('delete-payment-method', async (_event, id: unknown) => {
  const { deletePaymentMethod } = await import('./database/catalog')
  await deletePaymentMethod(id)
  return true
})

ipcMain.handle('get-transactions', async () => {
  const { listTransactions } = await import('./database/transactions')
  return listTransactions()
})

ipcMain.handle('create-transaction', async (_event, transaction: unknown) => {
  const { createTransaction } = await import('./database/transactions')
  return createTransaction(transaction)
})

ipcMain.handle('update-transaction', async (_event, id: unknown, transaction: unknown) => {
  const { updateTransaction } = await import('./database/transactions')
  return updateTransaction(id, transaction)
})

ipcMain.handle('delete-transaction', async (_event, id: unknown) => {
  const { deleteTransaction } = await import('./database/transactions')
  return deleteTransaction(id)
})

ipcMain.handle('get-income-overview', async (_event, yearMonth?: unknown) => {
  const { getIncomeOverview } = await import('./database/transactions')
  return getIncomeOverview(yearMonth)
})

ipcMain.handle('get-expense-overview', async (_event, yearMonth?: unknown) => {
  const { getExpenseOverview } = await import('./database/transactions')
  return getExpenseOverview(yearMonth)
})

ipcMain.handle('get-reports-overview', async (_event, options?: unknown) => {
  const { getReportsOverview } = await import('./database/transactions')
  return getReportsOverview(options)
})

ipcMain.handle('get-dashboard-overview', async (_event, yearMonth?: unknown) => {
  const { getDashboardOverview } = await import('./database/transactions')
  return getDashboardOverview(yearMonth)
})

ipcMain.handle('set-window-theme', async (_event, isLightTheme: boolean) => {
  applyWindowTheme(Boolean(isLightTheme))
  return true
})

ipcMain.handle('set-window-overlay', async (_event, visible: boolean) => {
  setTopBarOverlay(Boolean(visible))
  return true
})

app.setName(APP_NAME)
if (process.platform === 'win32') {
  app.setAppUserModelId(APP_ID)
}

app.whenReady().then(() => {
  try {
    createWindow()
    setInterval(() => {
      import('./database/backup')
        .then(({ runBackupIntegrityJob }) => runBackupIntegrityJob())
        .catch(() => undefined)
    }, 15 * 60 * 1000)
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
