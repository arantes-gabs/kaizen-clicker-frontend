import {
  clampOfflineSeconds,
  clampPoints,
} from '../limits'
import { applyProductionResult } from '../engine/progress'
import { resolveOfflineProduction } from '../engine/tick'
import { getFactoryMetrics } from '../formulas/factory'
import type { LoadedGame } from '../persistence/storage'
import { upgradeDefinitions } from '../../services/gameCatalog'
import type { GameState } from '../../store/gameStoreTypes'
import type {
  GameMetrics,
  PersistedGameState,
  UpgradeLevels,
} from '../../types/game'

export const MANUAL_CLICK_POWER = 1

export const defaultMetrics: GameMetrics = {
  elapsedSeconds: 0,
  lifetimePoints: 0,
  manualClicks: 0,
  totalUpgrades: 0,
  ordersCompleted: 0,
  bestProductionPerSecond: 0,
  totalPieces: 0,
  goodPieces: 0,
  defectivePieces: 0,
  downtimeSeconds: 0,
  offlinePoints: 0,
  lastOfflineSeconds: 0,
}

export function createUpgradeLevels(savedUpgrades?: UpgradeLevels): UpgradeLevels {
  return upgradeDefinitions.reduce((levels, definition) => {
    levels[definition.id] = {
      id: definition.id,
      level: savedUpgrades?.[definition.id]?.level ?? 0,
    }

    return levels
  }, {} as UpgradeLevels)
}

export function createFreshGameState(
  integrityNotice: string | null = null,
): GameState {
  const upgrades = createUpgradeLevels()
  const factory = getFactoryMetrics(upgrades)

  return {
    points: 0,
    productionPerSecond: factory.effectiveProductionPerSecond,
    clickPower: MANUAL_CLICK_POWER,
    factory,
    upgrades,
    metrics: { ...defaultMetrics },
    history: [],
    lastSampledAt: Date.now(),
    isPaused: false,
    integrityNotice,
  }
}

export function createInitialGameState(loadedGame: LoadedGame): GameState {
  const savedGame = loadedGame.state

  if (!savedGame) {
    return createFreshGameState(loadedGame.integrityNotice)
  }

  const upgrades = createUpgradeLevels(savedGame.upgrades)
  const factory = getFactoryMetrics(upgrades)
  const offlineSeconds = savedGame.isPaused
    ? 0
    : clampOfflineSeconds((Date.now() - savedGame.savedAt) / 1000)
  const offlineProduction =
    offlineSeconds > 0
      ? resolveOfflineProduction(factory, offlineSeconds)
      : null
  const restoredMetrics = savedGame.metrics
  const metrics = offlineProduction
    ? {
        ...applyProductionResult(restoredMetrics, offlineProduction),
        offlinePoints:
          restoredMetrics.offlinePoints + offlineProduction.pointsGained,
        lastOfflineSeconds: offlineSeconds,
        bestProductionPerSecond: Math.max(
          restoredMetrics.bestProductionPerSecond,
          factory.effectiveProductionPerSecond,
        ),
      }
    : restoredMetrics

  return {
    points: clampPoints(
      savedGame.points + (offlineProduction?.pointsGained ?? 0),
    ),
    productionPerSecond: factory.effectiveProductionPerSecond,
    clickPower: MANUAL_CLICK_POWER,
    factory,
    upgrades,
    metrics,
    history: savedGame.history,
    lastSampledAt: Date.now(),
    isPaused: savedGame.isPaused,
    integrityNotice: loadedGame.integrityNotice,
  }
}

export function serializeGameState(state: GameState): PersistedGameState {
  return {
    points: state.points,
    upgrades: state.upgrades,
    metrics: state.metrics,
    history: state.history,
    isPaused: state.isPaused,
    savedAt: Date.now(),
  }
}
