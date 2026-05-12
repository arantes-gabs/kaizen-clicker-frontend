import { FactoryStage } from '../components/factory/FactoryStage'
import { BottomHud } from '../components/layout/BottomHud'
import { GameHeader } from '../components/layout/GameHeader'
import { GameShell } from '../components/layout/GameShell'
import { UpgradesPanel } from '../components/upgrades/UpgradesPanel'
import { useGameLoop } from '../hooks/useGameLoop'
import { useGameStore } from '../store/useGameStore'

export function GamePage() {
  useGameLoop()

  const points = useGameStore((state) => state.points)
  const productionPerSecond = useGameStore((state) => state.productionPerSecond)
  const clickPower = useGameStore((state) => state.clickPower)
  const isPaused = useGameStore((state) => state.isPaused)
  const metrics = useGameStore((state) => state.metrics)
  const clickFactory = useGameStore((state) => state.clickFactory)
  const togglePause = useGameStore((state) => state.togglePause)

  return (
    <GameShell
      header={
        <GameHeader
          points={points}
          productionPerSecond={productionPerSecond}
          isPaused={isPaused}
          onTogglePause={togglePause}
        />
      }
      upgrades={<UpgradesPanel />}
      factory={
        <FactoryStage
          points={points}
          productionPerSecond={productionPerSecond}
          clickPower={clickPower}
          isPaused={isPaused}
          metrics={metrics}
          purchasePulse={metrics.totalUpgrades}
          onClickFactory={clickFactory}
        />
      }
      bottom={<BottomHud />}
    />
  )
}
