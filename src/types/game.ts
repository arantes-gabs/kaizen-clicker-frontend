export type UpgradeId =
  | 'handPress'
  | 'beltTuner'
  | 'kanbanRack'
  | 'qualityLoop'
  | 'microFoundry'
  | 'shiftCrew'

export type UpgradeAccent = 'green' | 'yellow' | 'red' | 'steel'

export type UpgradeCategory = 'manual' | 'automation' | 'quality' | 'team'

export interface UpgradeDefinition {
  id: UpgradeId
  name: string
  summary: string
  category: UpgradeCategory
  baseCost: number
  baseOutput: number
  costMultiplier: number
  accent: UpgradeAccent
}

export interface UpgradeState {
  id: UpgradeId
  level: number
}

export type UpgradeLevels = Record<UpgradeId, UpgradeState>

export interface GameMetrics {
  lifetimePoints: number
  manualClicks: number
  totalUpgrades: number
  ordersCompleted: number
  bestProductionPerSecond: number
}

export interface PersistedGameState {
  points: number
  upgrades: UpgradeLevels
  metrics: GameMetrics
  isPaused: boolean
  savedAt: number
}
