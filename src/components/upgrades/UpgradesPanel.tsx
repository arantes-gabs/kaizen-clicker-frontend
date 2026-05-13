import { upgradeDefinitions } from '../../services/gameCatalog'
import { useGameStore } from '../../store/useGameStore'
import { Panel } from '../ui/Panel'
import { UpgradeCard } from './UpgradeCard'

export function UpgradesPanel() {
  const points = useGameStore((state) => state.points)
  const upgrades = useGameStore((state) => state.upgrades)
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade)

  return (
    <Panel
      className="flex flex-col p-3 sm:p-4 lg:h-full lg:min-h-0"
      eyebrow="Módulos"
      title="Melhorias"
    >
      <div className="grid auto-rows-max gap-2 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-1 lg:content-start lg:overflow-y-auto lg:pr-1">
        {upgradeDefinitions.map((definition) => (
          <UpgradeCard
            definition={definition}
            key={definition.id}
            level={upgrades[definition.id].level}
            points={points}
            onPurchase={purchaseUpgrade}
          />
        ))}
      </div>
    </Panel>
  )
}
