import type { HTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { Card } from './Card'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  eyebrow?: string
  action?: ReactNode
  children: ReactNode
}

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
  ...props
}: PanelProps) {
  return (
    <Card className={classNames('p-4 sm:p-5', className)} {...props}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-[0.68rem] font-black uppercase text-emerald-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-xl font-black text-slate-900">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}
