import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  invoke: (channel: string, ...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args),

  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => {
      callback(...args)
    }

    ipcRenderer.on(channel, listener)

    return () => {
      ipcRenderer.removeListener(channel, listener)
    }
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
