import { app, BrowserWindow, dialog, ipcMain, Tray } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let tray

function getIconPath() {
  return app.isPackaged
    ? path.join(__dirname, '../dist/branding/Icon.png')
    : path.join(process.cwd(), 'public', 'branding', 'Icon.png')
}

function createWindow() {
  const win = new BrowserWindow({
    backgroundColor: '#0A0A0B',
    icon: getIconPath(),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0A0A0B',
      symbolColor: '#E8E8EC',
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

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
  const { getDatabasePath } = await import('./database/connection.js')
  return getDatabasePath()
})
ipcMain.handle('get-setup-preferences', async () => {
  const { getSetupPreferences } = await import('./database/initialize.js');
  return getSetupPreferences();
});

ipcMain.handle('initialize-database', async (_event, preferences) => {
  const { initializeDatabase } = await import('./database/initialize.js')
  await initializeDatabase(preferences)
  return { initialized: true }
})

app.whenReady().then(() => {
  try {
    createWindow()
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error)
    fs.writeFileSync(path.join(process.env.TEMP ?? app.getPath('temp'), 'dystomentum-startup-error.log'), message)
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