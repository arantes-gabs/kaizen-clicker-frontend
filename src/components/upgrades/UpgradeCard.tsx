import { memo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  canPurchaseUpgrade,
  getUpgradeCost,
} from '../../game/formulas/upgrades'
import type { UpgradeDefinition } from '../../types/game'
import { classNames } from '../../utils/classNames'
import { formatNumber } from '../../utils/format'

interface UpgradeCardProps {
  definition: UpgradeDefinition
  level: number
  points: number
  onPurchase: (id: UpgradeDefinition['id']) => void
}

interface BuiltFeedback {
  id: number
  x: number
  y: number
}

const accentClasses: Record<UpgradeDefinition['accent'], string> = {
  green: 'from-emerald-50 via-white to-emerald-100 border-emerald-200',
  yellow: 'from-amber-50 via-white to-amber-100 border-amber-200',
  red: 'from-red-50 via-white to-red-100 border-red-200',
  steel: 'from-slate-50 via-white to-slate-100 border-slate-200',
}

const iconLabels: Record<UpgradeDefinition['id'], string> = {
  fiveS: '5S',
  kanban: 'KB',
  pokaYoke: 'PY',
  tpm: 'TP',
  andon: 'AN',
  jidoka: 'JI',
  heijunka: 'HJ',
  justInTime: 'JIT',
}

function getRarity(level: number): string {
  if (level >= 5) {
    return 'Mestre'
  }

  if (level >= 3) {
    return 'Raro'
  }

  if (level >= 1) {
    return 'Ajustado'
  }

  return 'Inicial'
}

export const UpgradeCard = memo(function UpgradeCard({
  definition,
  level,
  points,
  onPurchase,
}: UpgradeCardProps) {
  const [builtFeedbacks, setBuiltFeedbacks] = useState<BuiltFeedback[]>([])
  const feedbackTimersRef = useRef<number[]>([])
  const cost = getUpgradeCost(definition, level)
  const isMaxed = level >= definition.maxLevel
  const isAffordable = canPurchaseUpgrade(definition, level, points)
  const progress = Math.min(100, (level / definition.maxLevel) * 100)

  useEffect(() => {
    return () => {
      feedbackTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId)
      })
    }
  }, [])

  function handlePurchase(): void {
    if (!isAffordable) {
      return
    }

    const feedback: BuiltFeedback = {
      id: Date.now() + Math.random(),
      x: Math.round(Math.random() * 22 - 11),
      y: Math.round(Math.random() * 10 - 5),
    }

    setBuiltFeedbacks((currentFeedbacks) => [...currentFeedbacks, feedback])

    const timerId = window.setTimeout(() => {
      setBuiltFeedbacks((currentFeedbacks) =>
        currentFeedbacks.filter((item) => item.id !== feedback.id),
      )
      feedbackTimersRef.current = feedbackTimersRef.current.filter(
        (currentTimerId) => currentTimerId !== timerId,
      )
    }, 850)
    feedbackTimersRef.current.push(timerId)

    onPurchase(definition.id)
  }

  return (
    <motion.article
      className={classNames(
        'relative overflow-hidden rounded-[1.25rem] border-2 bg-gradient-to-br p-2.5 shadow-[0_5px_0_rgba(148,163,184,0.22),0_10px_18px_rgba(15,23,42,0.07)]',
        accentClasses[definition.accent],
      )}
      whileHover={{ y: -5, rotate: -0.4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
    >
      <AnimatePresence>
        {builtFeedbacks.map((feedback) => (
          <motion.span
            className="pointer-events-none absolute right-3 top-3 z-20 rounded-full border-2 border-white bg-emerald-300 px-3 py-1 font-display text-sm font-black text-emerald-950 shadow-[0_4px_0_#16a34a]"
            key={feedback.id}
            initial={{ opacity: 0, x: feedback.x, y: 8 + feedback.y, scale: 0.65 }}
            animate={{
              opacity: 1,
              x: feedback.x,
              y: -24 + feedback.y,
              scale: [0.8, 1.08, 1],
            }}
            exit={{ opacity: 0, x: feedback.x, y: -42 + feedback.y, scale: 0.8 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            COMPRADO
          </motion.span>
        ))}
      </AnimatePresence>

      <div className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-2">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-white bg-slate-900 font-display text-xs font-black text-white shadow-[0_4px_0_rgba(15,23,42,0.22)]"
        >
          {iconLabels[definition.id]}
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-display text-base font-black leading-none text-slate-950">
              {definition.name}
            </h3>
            <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[0.62rem] font-black uppercase text-slate-500">
              {getRarity(level)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[0.72rem] font-bold leading-tight text-slate-500">
            {definition.summary}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[0.68rem] font-black uppercase text-slate-500">
            <span>L{level}/{definition.maxLevel}</span>
            <span className="text-emerald-700">{definition.effectLabel}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_94px] items-end gap-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-[0.65rem] font-black uppercase text-slate-400">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-white bg-white/80 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-300"
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            />
          </div>
        </div>

        <motion.button
          type="button"
          className={classNames(
            'grid h-14 place-items-center rounded-[1.15rem] border-2 px-2 text-center leading-none transition',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400',
            isAffordable
              ? 'border-amber-200 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 text-amber-950 shadow-[0_6px_0_#d08a09,0_10px_16px_rgba(251,191,36,0.22)]'
              : 'border-slate-200 bg-gradient-to-b from-white to-slate-100 text-slate-400 shadow-[0_5px_0_#cbd5e1]',
          )}
          onClick={handlePurchase}
          disabled={!isAffordable}
          whileHover={isAffordable ? { y: -2, scale: 1.03 } : undefined}
          whileTap={isAffordable ? { y: 4, scale: 0.96 } : undefined}
          transition={{ type: 'spring', stiffness: 520, damping: 24 }}
        >
          <span className="font-display text-lg font-black leading-none">
            {isMaxed ? 'Máx' : 'Comprar'}
          </span>
          <span className="-mt-1 text-[0.7rem] font-black opacity-75">
            {isMaxed ? 'L5' : formatNumber(cost)}
          </span>
        </motion.button>
      </div>

    </motion.article>
  )
})
