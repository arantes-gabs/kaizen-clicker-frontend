import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { formatNumber, formatRate } from '../../utils/format'

interface GameHeaderProps {
  points: number
  productionPerSecond: number
  isPaused: boolean
  onTogglePause: () => void
}

export function GameHeader({
  points,
  productionPerSecond,
  isPaused,
  onTogglePause,
}: GameHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="rounded-[1.6rem] border-2 border-white bg-white/78 p-2.5 shadow-[0_7px_0_rgba(148,163,184,0.14),0_16px_26px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[0.65rem] font-black uppercase text-amber-500">
            Tiny factory shift
          </p>
          <h1 className="font-display text-2xl font-black leading-none text-slate-950 sm:text-3xl">
            Kaizen Clicker
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(130px,1fr)_minmax(130px,1fr)_auto] sm:items-center">
          <motion.div
            className="rounded-[1.15rem] border-2 border-emerald-100 bg-gradient-to-b from-white to-emerald-50 px-3 py-1.5 shadow-[inset_0_-3px_0_rgba(52,211,153,0.16)]"
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-[0.68rem] font-black uppercase text-emerald-500">
              Score
            </p>
            <p className="text-xl font-black leading-tight text-slate-950" aria-live="polite">
              {formatNumber(points)}
            </p>
          </motion.div>
          <div className="rounded-[1.15rem] border-2 border-amber-100 bg-gradient-to-b from-white to-amber-50 px-3 py-1.5 shadow-[inset_0_-3px_0_rgba(251,191,36,0.16)]">
            <p className="text-[0.68rem] font-black uppercase text-amber-500">
              Flow
            </p>
            <p className="text-xl font-black leading-tight text-slate-950">
              {formatRate(productionPerSecond)}
            </p>
          </div>
          <Button
            className="col-span-2 sm:col-span-1"
            variant={isPaused ? 'secondary' : 'ghost'}
            onClick={onTogglePause}
            aria-pressed={isPaused}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>
    </motion.header>
  )
}
