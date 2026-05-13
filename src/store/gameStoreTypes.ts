import type {
  FactoryMetrics,
  GameMetrics,
  ProductionSample,
  UpgradeId,
  UpgradeLevels,
} from '../types/game'

export interface GameState {
  points: number
  productionPerSecond: number
  clickPower: number
  factory: FactoryMetrics
  upgrades: UpgradeLevels
  metrics: GameMetrics
  history: ProductionSample[]
  lastSampledAt: number
  isPaused: boolean
  integrityNotice: string | null
}

export interface GameActions {
  clickFactory: () => void
  purchaseUpgrade: (id: UpgradeId) => void
  tick: (deltaSeconds: number) => void
  togglePause: () => void
  dismissIntegrityNotice: () => void
}

export type GameStore = GameState & GameActions
