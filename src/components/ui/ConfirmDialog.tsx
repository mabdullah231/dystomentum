import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isLightTheme: boolean
  isDestructive?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLightTheme,
  isDestructive = true,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const panelClass = isLightTheme
    ? 'border-[#D4D4D8] bg-white text-[#18181B]'
    : 'border-[#27272A] bg-[#18181B] text-white'

  const confirmBg = isDestructive
    ? isLightTheme
      ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
      : 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
    : isLightTheme
      ? 'bg-[#18181B] text-white hover:bg-[#27272A]'
      : 'bg-white text-[#18181B] hover:bg-[#E4E4E7]'

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={cn(
          'w-full max-w-md rounded-[14px] border p-6 shadow-xl dialog-enter',
          panelClass
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${isLightTheme ? 'text-[#18181B]' : 'text-white'}`}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className={`rounded p-1 transition ${
              isLightTheme ? 'hover:bg-[#E4E4E7]' : 'hover:bg-[#1E1E24]'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mt-2 text-sm ${isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'}`}>
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`rounded-xl border px-4 py-2 text-sm font-medium ${
              isLightTheme
                ? 'border-[#D4D4D8] text-[#18181B] hover:bg-[#F4F4F5]'
                : 'border-[#27272A] text-white hover:bg-[#1E1E24]'
            }`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${confirmBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}