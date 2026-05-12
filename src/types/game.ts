export type UpgradeId =
  | 'fiveS'
  | 'kanban'
  | 'pokaYoke'
  | 'tpm'
  | 'andon'
  | 'jidoka'
  | 'heijunka'
  | 'justInTime'

export type UpgradeAccent = 'green' | 'yellow' | 'red' | 'steel'

export type UpgradeCategory = 'manual' | 'automation' | 'quality' | 'team'

export interface UpgradeDefinition {
  id: UpgradeId
  name: string
  summary: string
  category: UpgradeCategory
  baseCost: number
  effectLabel: string
  maxLevel: number
  accent: UpgradeAccent
}

export interface UpgradeState {
  id: UpgradeId
  level: number
}

export type UpgradeLevels = Record<UpgradeId, UpgradeState>

export interface GameMetrics {
  elapsedSeconds: number
  lifetimePoints: number
  manualClicks: number
  totalUpgrades: number
  ordersCompleted: number
  bestProductionPerSecond: number
  totalPieces: number
  goodPieces: number
  defectivePieces: number
  downtimeSeconds: number
  offlinePoints: number
  lastOfflineSeconds: number
}

export interface ProductionSample {
  timestamp: number
  goodPieces: number
  defectivePieces: number
  productionPerMinute: number
  defectsPerMinute: number
  oee: number
}

export interface FactoryMetrics {
  rawProductionPerSecond: number
  effectiveProductionPerSecond: number
  producedPiecesPerSecond: number
  defectivePiecesPerSecond: number
  defectRate: number
  availability: number
  performance: number
  quality: number
  oee: number
  downtimeRate: number
  fluctuationPenalty: number
  isJustInTimeActive: boolean
}

export interface PersistedGameState {
  points: number
  upgrades: UpgradeLevels
  metrics: GameMetrics
  history: ProductionSample[]
  isPaused: boolean
  savedAt: number
}
