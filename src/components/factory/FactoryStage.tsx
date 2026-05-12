import { Card } from '../ui/Card'
import { ClickerCore } from './ClickerCore'
import { ConveyorBelt } from './ConveyorBelt'
import { FactoryDashboard } from '../dashboard/FactoryDashboard'
import type { FactoryMetrics, GameMetrics, ProductionSample } from '../../types/game'
import { formatNumber, formatRate } from '../../utils/format'

interface FactoryStageProps {
  points: number
  productionPerSecond: number
  clickPower: number
  factory: FactoryMetrics
  isPaused: boolean
  metrics: GameMetrics
  history: ProductionSample[]
  purchasePulse: number
  onClickFactory: () => void
}

export function FactoryStage({
  points,
  productionPerSecond,
  clickPower,
  factory,
  isPaused,
  metrics,
  history,
  purchasePulse,
  onClickFactory,
}: FactoryStageProps) {
  const statusItems = [
    {
      label: 'Produção',
      value: formatRate(factory.rawProductionPerSecond),
      tone: 'green',
    },
    {
      label: 'Fluxo bom',
      value: formatRate(productionPerSecond),
      tone: 'green',
    },
    {
      label: 'Defeitos',
      value: `${formatNumber(factory.defectRate * 100)}%`,
      tone: 'yellow',
    },
    {
      label: 'OEE',
      value: `${formatNumber(factory.oee * 100)}%`,
      tone: 'steel',
    },
    {
      label: 'Qualidade',
      value: `${formatNumber(factory.quality * 100)}%`,
      tone: 'green',
    },
    {
      label: 'Paradas',
      value: `${formatNumber(factory.downtimeRate * 100)}%`,
      tone: 'yellow',
    },
  ] as const
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
            Chão da fábrica
          </p>
          <h2 className="font-display text-3xl font-black leading-none text-slate-950 sm:text-4xl">
            Melhore sempre
          </h2>
        </div>
        <div
          className="rounded-[1.4rem] border-2 border-emerald-100 bg-white/80 px-4 py-2 text-right shadow-[inset_0_-4px_0_rgba(52,211,153,0.14)]"
        >
          <p className="text-[0.68rem] font-black uppercase text-emerald-500">
            Poder do clique
          </p>
          <p className="text-xl font-black text-slate-950">
            +{formatNumber(clickPower)}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
        <ConveyorBelt
          defectRate={factory.defectRate}
          productionPulse={Math.floor(metrics.totalPieces)}
          purchasePulse={purchasePulse}
        />

        <div className="relative grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-[1.75rem] border-2 border-white bg-white/55 p-3 shadow-inner">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_18%_80%,rgba(251,191,36,0.13),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(52,211,153,0.12),transparent_24%)]" />

          <div className="relative z-10 grid min-h-0 place-items-center">
            <div className="grid place-items-center">
              <div
                className="mb-2 rounded-[1.35rem] border-2 border-amber-100 bg-white/92 px-5 py-2 text-center shadow-[0_5px_0_rgba(251,191,36,0.18),0_12px_22px_rgba(15,23,42,0.06)]"
              >
                <p className="text-[0.68rem] font-black uppercase text-slate-400">
                  Pontuação atual
                </p>
                <p className="font-display text-4xl font-black leading-none text-slate-950">
                  {formatNumber(points)} pontos
                </p>
              </div>

              <ClickerCore
                clickPower={clickPower}
                isPaused={isPaused}
                onClickFactory={onClickFactory}
              />
            </div>
          </div>

          <div className="relative z-10 grid gap-2">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
              {statusItems.map((item) => (
                <div
                  className={[
                    'rounded-2xl border-2 px-3 py-2 shadow-[inset_0_-3px_0_rgba(255,255,255,0.72),0_8px_16px_rgba(15,23,42,0.05)]',
                    getStatusClasses(item.tone),
                  ].join(' ')}
                  key={item.label}
                >
                  <p className="text-[0.65rem] font-black uppercase opacity-70">
                    {item.label}
                  </p>
                  <p className="font-display text-lg font-black leading-tight">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <FactoryDashboard
              factory={factory}
              history={history}
              metrics={metrics}
              productionPerSecond={productionPerSecond}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
