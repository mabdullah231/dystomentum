import { useEffect, useMemo, useState } from 'react'
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

export function ExportPage({ isLightTheme = false }: ExportPageProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [selectedRange, setSelectedRange] = useState<ExportRange>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [includeIncome, setIncludeIncome] = useState(true)
  const [includeExpense, setIncludeExpense] = useState(true)
  const [includeTransfers, setIncludeTransfers] = useState(false)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [anonymizeValues, setAnonymizeValues] = useState(false)
  const [destinationPath, setDestinationPath] = useState('')
  const [suggestedFilename, setSuggestedFilename] = useState('')
  const [recentExports, setRecentExports] = useState<RecentExport[]>([])
  const [recordCount, setRecordCount] = useState(0)
  const [estimatedSize, setEstimatedSize] = useState('0 B')
  const [status, setStatus] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const headingClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const statusClass = status.startsWith('Unable') || status.startsWith('Choose') ? 'text-red-400' : mutedClass
  const fieldClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B]'
    : 'border-[#27272A] bg-[#121215] text-white'

  const exportOptions = useMemo(() => ({
    format: selectedFormat,
    range: selectedRange,
    startDate: selectedRange === 'date-range' ? startDate : null,
    endDate: selectedRange === 'date-range' ? endDate : null,
    destinationPath,
    includeIncome,
    includeExpense,
    includeNotes,
    anonymizeValues,
  }), [selectedFormat, selectedRange, startDate, endDate, destinationPath, includeIncome, includeExpense, includeNotes, anonymizeValues])

  useEffect(() => {
    void window.electronAPI.invoke('get-setup-preferences').then((preferences) => {
      if (!preferences || typeof preferences !== 'object') return
      const backupPath = (preferences as { backupPath?: unknown }).backupPath
      if (typeof backupPath === 'string') setDestinationPath(backupPath)
    })

    void window.electronAPI.invoke('list-export-history').then((rows) => {
      if (Array.isArray(rows)) setRecentExports(rows as RecentExport[])
    }).catch(() => setStatus('Unable to load export history.'))
  }, [])

  useEffect(() => {
    if (!destinationPath) return
    void window.electronAPI.invoke('preview-export', exportOptions).then((preview) => {
      if (!preview || typeof preview !== 'object') return
      const typedPreview = preview as { recordCount?: number; estimatedSize?: string; suggestedFilename?: string }
      setRecordCount(Math.max(0, typedPreview.recordCount ?? 0))
      setEstimatedSize(typedPreview.estimatedSize ?? '0 B')
      setSuggestedFilename(typedPreview.suggestedFilename ?? '')
    }).catch(() => setStatus('Unable to preview export.'))
  }, [destinationPath, exportOptions])

  const handleBrowse = async () => {
    const selectedPath = await window.electronAPI.invoke('select-export-folder')
    if (typeof selectedPath === 'string') setDestinationPath(selectedPath)
  }

  const handleExport = async () => {
    if (!includeIncome && !includeExpense && selectedFormat !== 'sqlite') {
      setStatus('Choose at least one transaction type.')
      return
    }
    if (!destinationPath.trim()) {
      setStatus('Choose an export folder.')
      return
    }
    if (selectedRange === 'date-range' && (!startDate || !endDate)) {
      setStatus('Choose both start and end dates.')
      return
    }
    if (selectedRange === 'date-range' && startDate > endDate) {
      setStatus('Choose an end date after the start date.')
      return
    }

    setIsExporting(true)
    setStatus('')
    try {
      const created = await window.electronAPI.invoke('run-export', exportOptions)
      const history = await window.electronAPI.invoke('list-export-history')
      if (Array.isArray(history)) setRecentExports(history as RecentExport[])
      if (created && typeof created === 'object') {
        setStatus(`Export created: ${(created as RecentExport).filename}`)
      } else {
        setStatus('Export created.')
      }
    } catch (error) {
      setStatus(error instanceof Error ? `Unable to create export. ${error.message}` : 'Unable to create export.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleOpenFolder = (targetPath: string) => {
    void window.electronAPI.invoke('open-path', targetPath).catch(() => setStatus('Unable to open that folder.'))
  }

  return (
    <div className="min-w-0 animate-screen-enter space-y-6 xl:space-y-8">
      <header>
        <h1 className={`text-[30px] font-bold tracking-tight ${headingClass}`}>Export Workspace Ledger</h1>
        <p className={`mt-1 text-sm ${mutedClass}`}>
          Extract, filter and archive your financial workspace securely. Offline execution.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <ExportFormatSelector selected={selectedFormat} onSelect={setSelectedFormat} isLightTheme={isLightTheme} />

          <div className="grid gap-4 sm:grid-cols-2">
            <ExportRangeSelector selected={selectedRange} onSelect={setSelectedRange} isLightTheme={isLightTheme} />
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

          {selectedRange === 'date-range' && (
            <div className={`grid gap-4 rounded-xl border p-4 sm:grid-cols-2 ${isLightTheme ? 'border-[#D4D4D8] bg-white' : 'border-[#27272A] bg-[#18181B]'}`}>
              <label>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#71717A]">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${fieldClass}`}
                />
              </label>
              <label>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#71717A]">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${fieldClass}`}
                />
              </label>
            </div>
          )}

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
              onBrowse={() => void handleBrowse()}
              onPathChange={setDestinationPath}
              isLightTheme={isLightTheme}
            />
          </div>

          <ExecutionBar
            recordCount={recordCount}
            estimatedSize={estimatedSize}
            onExport={() => void handleExport()}
            isLightTheme={isLightTheme}
          />
          <p role="status" className={`text-sm ${statusClass}`}>{isExporting ? 'Exporting ledger data...' : status}</p>
        </div>

        <div className="h-full">
          <RecentExportsList exports={recentExports} onOpenFolder={handleOpenFolder} isLightTheme={isLightTheme} />
        </div>
      </div>
    </div>
  )
}
