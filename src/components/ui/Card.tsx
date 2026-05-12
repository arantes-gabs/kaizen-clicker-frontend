import type { HTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'

type CardTone = 'default' | 'sunken' | 'highlight'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  tone?: CardTone
}

const toneClasses: Record<CardTone, string> = {
  default:
    'border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-[0_14px_0_rgba(148,163,184,0.16),0_22px_42px_rgba(15,23,42,0.09)]',
  sunken:
    'border-slate-200 bg-gradient-to-b from-slate-100 to-slate-200 shadow-inner',
  highlight:
    'border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-amber-50 shadow-[0_16px_0_rgba(52,211,153,0.16),0_28px_52px_rgba(16,185,129,0.16)]',
}

export function Card({
  children,
  className,
  tone = 'default',
  ...props
}: CardProps) {
  return (
    <div
      className={classNames(
        'rounded-[2rem] border-2',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
