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
      className="flex h-full min-h-0 flex-col p-3 sm:p-4"
      eyebrow="Módulos"
      title="Melhorias"
    >
      <div className="grid min-h-0 flex-1 auto-rows-max content-start gap-2 overflow-y-auto pr-1">
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
