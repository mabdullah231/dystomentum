import type { ButtonHTMLAttributes } from 'react'

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-white text-black hover:bg-[#E4E4E7] hover:shadow-lg hover:shadow-white/10',
        variant === 'secondary' && 'border border-[#27272A] bg-[#121215] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-white',
        variant === 'ghost' && 'text-[#A1A1AA] hover:bg-[#1E1E24] hover:text-white',
        className,
      )}
      {...props}
    />
  )
}
