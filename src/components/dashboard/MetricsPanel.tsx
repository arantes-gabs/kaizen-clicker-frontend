import { useGameStore } from '../../store/useGameStore'
import { formatNumber, formatRate } from '../../utils/format'
import { ChartPlaceholder } from './ChartPlaceholder'
import { StatWidget } from './StatWidget'
import { Panel } from '../ui/Panel'

const productionTrend = [26, 38, 34, 52, 48, 62, 74, 68, 82, 88]
const qualityMix = [40, 44, 58, 54, 66, 72, 70, 78, 76, 84]

export function MetricsPanel() {
  const productionPerSecond = useGameStore((state) => state.productionPerSecond)
  const clickPower = useGameStore((state) => state.clickPower)
  const metrics = useGameStore((state) => state.metrics)
  const isPaused = useGameStore((state) => state.isPaused)

  return (
    <Panel className="hidden shrink-0 p-3 sm:p-4 lg:block" eyebrow="Notes" title="Tiny Stats">
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <StatWidget
            label="Rate"
            value={formatRate(productionPerSecond)}
            tone="green"
          />
          <StatWidget label="Tap" value={`+${formatNumber(clickPower)}`} tone="yellow" />
          <StatWidget
            label="Orders"
            value={formatNumber(metrics.ordersCompleted)}
          />
          <StatWidget
            label="Status"
            value={isPaused ? 'Paused' : 'Running'}
            tone={isPaused ? 'yellow' : 'green'}
          />
        </div>

        <div className="rounded-[1.2rem] border-2 border-slate-200 bg-white/75 p-2.5">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-slate-400">Lifetime</dt>
              <dd className="font-black text-slate-800">
                {formatNumber(metrics.lifetimePoints)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-slate-400">Clicks</dt>
              <dd className="font-black text-slate-800">
                {formatNumber(metrics.manualClicks)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-slate-400">Upgrades</dt>
              <dd className="font-black text-slate-800">
                {formatNumber(metrics.totalUpgrades)}
              </dd>
            </div>
          </dl>
        </div>

        <ChartPlaceholder title="Production trend" values={productionTrend} />
        <div className="hidden 2xl:block">
          <ChartPlaceholder title="Quality mix" values={qualityMix} />
        </div>
      </div>
    </Panel>
  )
}
