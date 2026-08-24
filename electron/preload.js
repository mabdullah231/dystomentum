import { contextBridge, ipcRenderer } from 'electron';
const electronAPI = {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, callback) => {
        const listener = (_event, ...args) => {
            callback(...args);
        };
        ipcRenderer.on(channel, listener);
        return () => {
            ipcRenderer.removeListener(channel, listener);
        };
    },
};
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
