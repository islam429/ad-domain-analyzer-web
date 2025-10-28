import React from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export function Button({ className, variant = 'primary', size = 'md', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const byVariant: Record<Variant, string> = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-400',
    secondary: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm focus:ring-brand-400',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-900',
    danger: 'bg-danger hover:bg-red-600 text-white focus:ring-red-300',
  }
  const bySize: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  }
  return <button className={clsx(base, byVariant[variant], bySize[size], className)} {...props} />
}
