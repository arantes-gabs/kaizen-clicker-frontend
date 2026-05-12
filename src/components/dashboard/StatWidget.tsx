import { classNames } from '../../utils/classNames'

type StatTone = 'green' | 'yellow' | 'steel'

interface StatWidgetProps {
  label: string
  value: string
  tone?: StatTone
}

const toneClasses: Record<StatTone, string> = {
  green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  yellow: 'border-amber-100 bg-amber-50 text-amber-700',
  steel: 'border-slate-200 bg-slate-100 text-slate-700',
}

export function StatWidget({ label, value, tone = 'steel' }: StatWidgetProps) {
  return (
    <div
      className={classNames(
        'rounded-2xl border-2 px-3 py-2 shadow-[inset_0_-3px_0_rgba(255,255,255,0.7)]',
        toneClasses[tone],
      )}
    >
      <p className="text-[0.68rem] font-black uppercase opacity-70">{label}</p>
      <p className="mt-0.5 font-display text-lg font-black">{value}</p>
    </div>
  )
}
