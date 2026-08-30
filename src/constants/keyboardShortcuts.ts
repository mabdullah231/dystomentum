export type KeyboardShortcutAction = 'newTransaction' | 'dashboard' | 'transactions' | 'export' | 'backup' | 'settings' | 'toggleTheme'

export const keyboardShortcuts: Array<{ action: KeyboardShortcutAction; label: string; shortcut: string }> = [
  { action: 'newTransaction', label: 'Create New Transaction Entry', shortcut: 'Ctrl + N' },
  { action: 'dashboard', label: 'Open Dashboard', shortcut: 'Ctrl + 1' },
  { action: 'transactions', label: 'Open Transactions', shortcut: 'Ctrl + 2' },
  { action: 'export', label: 'Open Export Workspace', shortcut: 'Ctrl + E' },
  { action: 'backup', label: 'Open Backup & Restore', shortcut: 'Ctrl + Shift + B' },
  { action: 'settings', label: 'Open Application Settings', shortcut: 'Ctrl + ,' },
  { action: 'toggleTheme', label: 'Toggle Light/Dark Theme', shortcut: 'Ctrl + T' },
]
