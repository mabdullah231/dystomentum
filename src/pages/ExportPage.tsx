import { useState } from 'react'
import { ExportFormatSelector, ExportFormat } from '../components/exports/ExportFormatSelector'
import { ExportRangeSelector, ExportRange } from '../components/exports/ExportRangeSelector'
import { TransactionTypeCheckboxes } from '../components/exports/TransactionTypeCheckboxes'
import { ToggleSwitches } from '../components/exports/ToggleSwitches'
import { PathControls } from '../components/exports/PathControls'
import { ExecutionBar } from '../components/exports/ExecutionBar'
import { RecentExportsList, RecentExport } from '../components/exports/RecentExportsList'

interface ExportPageProps {
  isLightTheme?: boolean
}

// Mock data – will be replaced with real data from DB and file system
const mockRecentExports: RecentExport[] = [
  { id: '1', format: 'XLSX', date: 'Jul 25, 2026', size: '412 KB', filename: 'ledger_annual_2026.xlsx', path: '/exports/ledger_annual_2026.xlsx' },
  { id: '2', format: 'CSV', date: 'Jul 20, 2026', size: '287 KB', filename: 'full_archive_vault_jul.csv', path: '/exports/full_archive_vault_jul.csv' },
  { id: '3', format: 'SQLITE', date: 'Jul 15, 2026', size: '1.2 MB', filename: 'dystomentum_backup.sqlite', path: '/exports/dystomentum_backup.sqlite' },
  { id: '4', format: 'JSON', date: 'Jul 10, 2026', size: '892 KB', filename: 'ledger_export_Q3.json', path: '/exports/ledger_export_Q3.json' },
]

export function ExportPage({ isLightTheme = false }: ExportPageProps) {
  // State for form controls
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [selectedRange, setSelectedRange] = useState<ExportRange>('all')
  const [includeIncome, setIncludeIncome] = useState(true)
  const [includeExpense, setIncludeExpense] = useState(true)
  const [includeTransfers, setIncludeTransfers] = useState(false)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [anonymizeValues, setAnonymizeValues] = useState(false)
  const [destinationPath, setDestinationPath] = useState('/Users/alex/workspace/dystomentum/exports')
  const [suggestedFilename, setSuggestedFilename] = useState('dystomentum_ledger_2026-07-28.csv')

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  const handleBrowse = () => {
    // In real app, open native folder picker via IPC
    alert('Browse folder dialog would open here.')
  }

  const handleExport = () => {
    // In real app, trigger export process
    alert('Export process would start here.')
  }

  const handleOpenFolder = (path: string) => {
    // In real app, open folder in native file manager via IPC
    alert(`Opening folder: ${path}`)
  }

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      {/* Page Header */}
      <header>
        <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Export Workspace Ledger</h1>
        <p className={`mt-1 text-sm ${mutedClass}`}>
          Extract, filter and archive your financial workspace securely. Offline execution.
        </p>
      </header>

      {/* Main 2-column layout */}
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Left Panel – Configuration */}
        <div className="space-y-6">
          {/* Format Selection */}
          <ExportFormatSelector
            selected={selectedFormat}
            onSelect={setSelectedFormat}
            isLightTheme={isLightTheme}
          />

          {/* Range & Types 2-column grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ExportRangeSelector
              selected={selectedRange}
              onSelect={setSelectedRange}
              isLightTheme={isLightTheme}
            />
            <TransactionTypeCheckboxes
              includeIncome={includeIncome}
              includeExpense={includeExpense}
              includeTransfers={includeTransfers}
              onToggleIncome={() => setIncludeIncome(!includeIncome)}
              onToggleExpense={() => setIncludeExpense(!includeExpense)}
              onToggleTransfers={() => setIncludeTransfers(!includeTransfers)}
              isLightTheme={isLightTheme}
            />
          </div>

          {/* Toggles & Paths 2-column grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleSwitches
              includeNotes={includeNotes}
              anonymizeValues={anonymizeValues}
              onToggleNotes={() => setIncludeNotes(!includeNotes)}
              onToggleAnonymize={() => setAnonymizeValues(!anonymizeValues)}
              isLightTheme={isLightTheme}
            />
            <PathControls
              destinationPath={destinationPath}
              suggestedFilename={suggestedFilename}
              onBrowse={handleBrowse}
              onPathChange={setDestinationPath}
              isLightTheme={isLightTheme}
            />
          </div>

          {/* Execution Bar */}
          <ExecutionBar
            recordCount={247}
            estimatedSize="1.2 MB"
            onExport={handleExport}
            isLightTheme={isLightTheme}
          />
        </div>

        {/* Right Panel – Recent Exports */}
        <div className="h-full">
          <RecentExportsList
            exports={mockRecentExports}
            onOpenFolder={handleOpenFolder}
            isLightTheme={isLightTheme}
          />
        </div>
      </div>
    </div>
  )
}