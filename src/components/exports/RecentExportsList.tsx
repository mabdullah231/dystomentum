import { FolderOpen } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface RecentExport {
  id: string
  format: string // e.g., 'CSV', 'XLSX', 'JSON', 'SQLITE'
  date: string // formatted date
  size: string // e.g., '412 KB'
  filename: string
  path: string // full path to the file
}

interface RecentExportsListProps {
  exports: RecentExport[]
  onOpenFolder: (path: string) => void
  isLightTheme: boolean
}

export function RecentExportsList({ exports, onOpenFolder, isLightTheme }: RecentExportsListProps) {
  const containerClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white'
    : 'border-[#27272A] bg-[#18181B]'

  const cardClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5]'
    : 'border-[#27272A] bg-[#121215]'

  const textClass = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const mutedClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  const badgeClass = (format: string) => {
    const colors: Record<string, string> = {
      CSV: isLightTheme ? 'bg-[#E4E4E7] text-[#18181B]' : 'bg-[#1E1E24] text-[#A1A1AA]',
      XLSX: isLightTheme ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#063B2F] text-[#6EE7B7]',
      JSON: isLightTheme ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#1E1E24] text-[#FBBF24]',
      SQLITE: isLightTheme ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#1E1E24] text-[#60A5FA]',
    }
    return colors[format] || colors.CSV
  }

  return (
    <div className={`flex h-full flex-col rounded-[12px] border p-4 ${containerClass}`}>
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#71717A]">Recent Exports</div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {exports.length === 0 ? (
          <div className={`text-center text-sm ${mutedClass}`}>No recent exports yet.</div>
        ) : (
          exports.map((item) => (
            <div key={item.id} className={`rounded-lg border p-3 ${cardClass}`}>
              <div className="flex items-center justify-between">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClass(item.format)}`}>
                  {item.format}
                </span>
                <span className={`text-xs ${mutedClass}`}>{item.date}</span>
                <span className={`text-xs ${mutedClass}`}>{item.size}</span>
              </div>
              <div className={`mt-1 font-mono text-sm font-bold ${textClass}`}>{item.filename}</div>
              <button
                type="button"
                onClick={() => onOpenFolder(item.path)}
                className={`mt-2 flex items-center gap-1 text-xs font-medium ${mutedClass} hover:underline`}
              >
                <FolderOpen className="h-3 w-3" />
                Open Folder
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}