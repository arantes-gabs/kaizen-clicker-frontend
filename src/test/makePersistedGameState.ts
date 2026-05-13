import type { GameMetrics, PersistedGameState, UpgradeLevels } from '../types/game'
import { createUpgradeLevels, defaultMetrics } from '../game/state/gameState'

type PersistedGameStateOverrides = Partial<
  Omit<PersistedGameState, 'metrics' | 'upgrades'>
> & {
  metrics?: Partial<GameMetrics>
  upgrades?: UpgradeLevels
}

export function makePersistedGameState(
  overrides: PersistedGameStateOverrides = {},
): PersistedGameState {
  return {
    points: overrides.points ?? 0,
    upgrades: overrides.upgrades ?? createUpgradeLevels(),
    metrics: { ...defaultMetrics, ...overrides.metrics },
    history: overrides.history ?? [],
    isPaused: overrides.isPaused ?? false,
    savedAt: overrides.savedAt ?? Date.now(),
  }
}
