import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { ClickerCore } from './ClickerCore'
import { ConveyorBelt } from './ConveyorBelt'
import type { GameMetrics } from '../../types/game'
import { formatNumber, formatRate } from '../../utils/format'

interface FactoryStageProps {
  points: number
  productionPerSecond: number
  clickPower: number
  isPaused: boolean
  metrics: GameMetrics
  purchasePulse: number
  onClickFactory: () => void
}

export function FactoryStage({
  points,
  productionPerSecond,
  clickPower,
  isPaused,
  metrics,
  purchasePulse,
  onClickFactory,
}: FactoryStageProps) {
  const statusItems = [
    { label: 'Flow', value: formatRate(productionPerSecond), tone: 'green' },
    { label: 'Orders', value: formatNumber(metrics.ordersCompleted), tone: 'yellow' },
    { label: 'Upgrades', value: formatNumber(metrics.totalUpgrades), tone: 'steel' },
    { label: 'Lifetime', value: formatNumber(metrics.lifetimePoints), tone: 'green' },
    { label: 'Clicks', value: formatNumber(metrics.manualClicks), tone: 'steel' },
    { label: 'Tap', value: `+${formatNumber(clickPower)}`, tone: 'yellow' },
  ] as const
  const momentum = Math.min(100, 24 + metrics.totalUpgrades * 2)

  function getStatusClasses(tone: (typeof statusItems)[number]['tone']): string {
    if (tone === 'green') {
      return 'border-emerald-100 bg-emerald-50 text-emerald-700'
    }

    if (tone === 'yellow') {
      return 'border-amber-100 bg-amber-50 text-amber-700'
    }

    return 'border-slate-200 bg-white text-slate-700'
  }

  return (
    <Card
      className="relative grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-3 sm:p-4"
      tone="highlight"
    >
      <div className="factory-sparkles pointer-events-none absolute inset-0" />

      <div className="relative z-10 mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-black uppercase text-amber-500">
            Toy factory floor
          </p>
          <h2 className="font-display text-3xl font-black leading-none text-slate-950 sm:text-4xl">
            Make it better
          </h2>
        </div>
        <motion.div
          className="rounded-[1.4rem] border-2 border-emerald-100 bg-white/80 px-4 py-2 text-right shadow-[inset_0_-4px_0_rgba(52,211,153,0.14)]"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <p className="text-[0.68rem] font-black uppercase text-emerald-500">
            Tap power
          </p>
          <p className="text-xl font-black text-slate-950">
            +{formatNumber(clickPower)}
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
        <ConveyorBelt purchasePulse={purchasePulse} />

        <div className="relative grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-[1.75rem] border-2 border-white bg-white/55 p-3 shadow-inner">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_18%_80%,rgba(251,191,36,0.13),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(52,211,153,0.12),transparent_24%)]" />

          <div className="relative z-10 grid min-h-0 place-items-center">
            <div className="grid place-items-center">
              <motion.div
                className="mb-2 rounded-[1.35rem] border-2 border-amber-100 bg-white/92 px-5 py-2 text-center shadow-[0_5px_0_rgba(251,191,36,0.18),0_12px_22px_rgba(15,23,42,0.06)]"
                animate={{ scale: [1, 1.015, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-[0.68rem] font-black uppercase text-slate-400">
                  Current score
                </p>
                <p className="font-display text-4xl font-black leading-none text-slate-950">
                  {formatNumber(points)} points
                </p>
              </motion.div>

              <ClickerCore
                clickPower={clickPower}
                isPaused={isPaused}
                onClickFactory={onClickFactory}
              />
            </div>
          </div>

          <div className="relative z-10 grid gap-2">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
              {statusItems.map((item, index) => (
                <motion.div
                  className={[
                    'rounded-2xl border-2 px-3 py-2 shadow-[inset_0_-3px_0_rgba(255,255,255,0.72),0_8px_16px_rgba(15,23,42,0.05)]',
                    getStatusClasses(item.tone),
                  ].join(' ')}
                  key={item.label}
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    delay: index * 0.05,
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <p className="text-[0.65rem] font-black uppercase opacity-70">
                    {item.label}
                  </p>
                  <p className="font-display text-lg font-black leading-tight">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-2 rounded-[1.35rem] border-2 border-white bg-white/78 p-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.05)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-[0.68rem] font-black uppercase text-slate-400">
                    Batch momentum
                  </p>
                  <p className="font-display text-lg font-black text-emerald-700">
                    {isPaused ? 'Paused' : 'Running'}
                  </p>
                </div>
                <div className="h-4 overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 shadow-inner">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-300"
                    animate={{ width: `${momentum}%` }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[0.68rem] font-black uppercase text-slate-500">
                <span className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">
                  Soft flow
                </span>
                <span className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-amber-700">
                  Better batch
                </span>
                <span className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  Toy line
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
