import { motion } from 'framer-motion'

interface ChartPlaceholderProps {
  title: string
  values: readonly number[]
}

export function ChartPlaceholder({ title, values }: ChartPlaceholderProps) {
  return (
    <div className="rounded-[1.2rem] border-2 border-slate-200 bg-gradient-to-b from-white to-slate-100 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-display text-sm font-black text-slate-800">{title}</p>
        <motion.span
          className="h-3 w-3 rounded-full bg-emerald-400"
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
        {values.map((value, index) => (
          <motion.span
            className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-300 to-amber-200"
            key={`${title}-${index}`}
            initial={{ height: 8 }}
            animate={{ height: `${value}%` }}
            transition={{ delay: index * 0.03, type: 'spring', stiffness: 160 }}
          />
        ))}
      </div>
    </div>
  )
}
