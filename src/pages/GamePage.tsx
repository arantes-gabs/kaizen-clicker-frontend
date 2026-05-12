import { FactoryStage } from '../components/factory/FactoryStage'
import { RankingPanel } from '../components/dashboard/RankingPanel'
import { BottomHud } from '../components/layout/BottomHud'
import { GameHeader } from '../components/layout/GameHeader'
import { GameShell } from '../components/layout/GameShell'
import { UpgradesPanel } from '../components/upgrades/UpgradesPanel'
import { useGameLoop } from '../hooks/useGameLoop'
import { useGameStore } from '../store/useGameStore'

export function GamePage() {
  useGameLoop()

  return (
    <GameShell
      header={<ConnectedHeader />}
      upgrades={
        <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3">
          <UpgradesPanel />
          <RankingPanel />
        </div>
      }
      factory={<ConnectedFactory />}
      bottom={<BottomHud />}
    />
  )
}

function ConnectedHeader() {
  const points = useGameStore((state) => state.points)
  const productionPerSecond = useGameStore((state) => state.productionPerSecond)
  const isPaused = useGameStore((state) => state.isPaused)
  const togglePause = useGameStore((state) => state.togglePause)

  return (
    <GameHeader
      points={points}
      productionPerSecond={productionPerSecond}
      isPaused={isPaused}
      onTogglePause={togglePause}
    />
  )
}

function ConnectedFactory() {
  const points = useGameStore((state) => state.points)
  const productionPerSecond = useGameStore((state) => state.productionPerSecond)
  const clickPower = useGameStore((state) => state.clickPower)
  const factory = useGameStore((state) => state.factory)
  const isPaused = useGameStore((state) => state.isPaused)
  const metrics = useGameStore((state) => state.metrics)
  const history = useGameStore((state) => state.history)
  const clickFactory = useGameStore((state) => state.clickFactory)

  return (
    <FactoryStage
      points={points}
      productionPerSecond={productionPerSecond}
      clickPower={clickPower}
      factory={factory}
      isPaused={isPaused}
      metrics={metrics}
      history={history}
      purchasePulse={metrics.totalUpgrades}
      onClickFactory={clickFactory}
    />
  )
}
