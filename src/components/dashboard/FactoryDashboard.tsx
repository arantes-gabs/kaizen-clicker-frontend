import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FactoryMetrics, GameMetrics, ProductionSample } from '../../types/game'
import { formatNumber, formatRate } from '../../utils/format'

interface FactoryDashboardProps {
  factory: FactoryMetrics
  history: ProductionSample[]
  metrics: GameMetrics
  productionPerSecond: number
}

function getLinePoints(samples: ProductionSample[]): string {
  if (samples.length === 0) {
    return '0,56 100,56'
  }

  const values = samples.map((sample) => sample.goodPieces)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)

  return samples
    .map((sample, index) => {
      const x = samples.length === 1 ? 100 : (index / (samples.length - 1)) * 100
      const y = 56 - ((sample.goodPieces - min) / range) * 48

      return `${x},${y}`
    })
    .join(' ')
}

function getDashboardSamples(
  history: ProductionSample[],
  metrics: GameMetrics,
  factory: FactoryMetrics,
): ProductionSample[] {
  if (history.length > 0) {
    return history.slice(-12)
  }

  return [
    {
      timestamp: Date.now(),
      goodPieces: metrics.goodPieces,
      defectivePieces: metrics.defectivePieces,
      productionPerMinute: factory.effectiveProductionPerSecond * 60,
      defectsPerMinute: factory.defectivePiecesPerSecond * 60,
      oee: factory.oee,
    },
  ]
}

export const FactoryDashboard = memo(function FactoryDashboard({
  factory,
  history,
  metrics,
  productionPerSecond,
}: FactoryDashboardProps) {
  const samples = useMemo(
    () => getDashboardSamples(history, metrics, factory),
    [factory, history, metrics],
  )
  const linePoints = useMemo(() => getLinePoints(samples), [samples])
  const maxDefects = useMemo(
    () => Math.max(1, ...samples.map((sample) => sample.defectsPerMinute)),
    [samples],
  )
  const oeePercent = Math.round(factory.oee * 100)
  const gaugeCircumference = 126
  const gaugeOffset = gaugeCircumference * (1 - factory.oee)

  return (
    <section className="grid gap-2 rounded-[1.35rem] border-2 border-white bg-white/78 p-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.05)] lg:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)_150px]">
      <div className="grid place-items-center rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-2 text-emerald-800">
        <svg viewBox="0 0 64 64" className="h-20 w-20" aria-label={`OEE ${oeePercent}%`}>
          <circle
            cx="32"
            cy="32"
            fill="none"
            r="20"
            stroke="rgba(15, 23, 42, 0.12)"
            strokeWidth="8"
          />
          <motion.circle
            cx="32"
            cy="32"
            fill="none"
            r="20"
            stroke="#34D399"
            strokeDasharray={gaugeCircumference}
            strokeLinecap="round"
            strokeWidth="8"
            initial={false}
            animate={{ strokeDashoffset: gaugeOffset }}
            style={{ rotate: -90, transformOrigin: '32px 32px' }}
          />
          <text
            x="32"
            y="35"
            textAnchor="middle"
            className="fill-emerald-900 font-display text-sm font-black"
          >
            {oeePercent}%
          </text>
        </svg>
        <p className="text-[0.65rem] font-black uppercase">Medidor OEE</p>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[0.65rem] font-black uppercase text-slate-400">
            Produção acumulada
          </p>
          <p className="font-display text-sm font-black text-emerald-700">
            {formatNumber(metrics.goodPieces)}
          </p>
        </div>
        <svg viewBox="0 0 100 60" className="h-20 w-full" aria-hidden="true">
          <polyline
            fill="none"
            points={linePoints}
            stroke="#34D399"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
          />
        </svg>
      </div>

      <div className="rounded-2xl border-2 border-amber-100 bg-amber-50 p-2">
        <div className="mb-2 flex items-center justify-between">
            <p className="text-[0.65rem] font-black uppercase text-amber-700/70">
            Defeitos/min
          </p>
          <p className="font-display text-sm font-black text-amber-800">
            {formatNumber(factory.defectivePiecesPerSecond * 60)}
          </p>
        </div>
        <div className="flex h-20 items-end gap-1.5" aria-hidden="true">
          {samples.map((sample) => (
            <motion.span
              className="flex-1 rounded-t-lg bg-gradient-to-t from-red-300 to-amber-200"
              key={sample.timestamp}
              initial={false}
              animate={{
                height: `${Math.max(8, (sample.defectsPerMinute / maxDefects) * 100)}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">
          <p className="text-[0.65rem] font-black uppercase opacity-70">
            Velocidade efetiva
          </p>
          <p className="font-display text-lg font-black">
            {formatRate(productionPerSecond)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-amber-100 bg-amber-50 px-3 py-2 text-amber-700">
          <p className="text-[0.65rem] font-black uppercase opacity-70">
            Taxa de defeito
          </p>
          <p className="font-display text-lg font-black">
            {formatNumber(factory.defectRate * 100)}%
          </p>
        </div>
      </div>
    </section>
  )
})
