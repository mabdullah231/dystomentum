import { FolderOpen } from 'lucide-react'
import { cn } from '../../utils/cn'

interface PathControlsProps {
  destinationPath: string
  suggestedFilename: string
  onBrowse: () => void
  onPathChange: (path: string) => void
  isLightTheme: boolean
}

export function PathControls({
  destinationPath,
  suggestedFilename,
  onBrowse,
  onPathChange,
  isLightTheme,
}: PathControlsProps) {
  const inputClass = isLightTheme
    ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B]'
    : 'border-[#27272A] bg-[#121215] text-white'

  const labelClass = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'

  return (
    <div className="space-y-4">
      <div>
        <div className={`mb-2 text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>Destination Folder</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={destinationPath}
            onChange={(e) => onPathChange(e.target.value)}
            className={`min-w-0 flex-1 rounded-xl border px-3 py-2 font-mono text-sm outline-none ${inputClass}`}
            placeholder="/path/to/exports"
          />
          <button
            type="button"
            onClick={onBrowse}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${
              isLightTheme
                ? 'border-[#D4D4D8] bg-[#F4F4F5] text-[#18181B] hover:bg-[#E4E4E7]'
                : 'border-[#27272A] bg-[#121215] text-white hover:bg-[#1E1E24]'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Browse
          </button>
        </div>
      </div>

      <div>
        <div className={`mb-2 text-[10px] font-bold uppercase tracking-[0.16em] ${labelClass}`}>Suggested Filename</div>
        <input
          type="text"
          value={suggestedFilename}
          readOnly
          className={`w-full rounded-xl border px-3 py-2 font-mono text-sm outline-none ${inputClass} cursor-not-allowed opacity-70`}
        />
      </div>
    </div>
  )
}
