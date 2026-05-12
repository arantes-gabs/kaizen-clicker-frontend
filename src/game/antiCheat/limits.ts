import type {
  GameMetrics,
  PersistedGameState,
  ProductionSample,
  UpgradeLevels,
} from '../../types/game'
import { upgradeDefinitions } from '../../services/gameCatalog'

export const MAX_TICK_SECONDS = 5
export const MAX_OFFLINE_SECONDS = 4 * 60 * 60
export const MAX_STORED_POINTS = 1_000_000_000_000
export const MAX_PRODUCTION_PER_SECOND = 1_000

export function clampTickSeconds(deltaSeconds: number): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
    return 0
  }

  return Math.min(deltaSeconds, MAX_TICK_SECONDS)
}

export function clampOfflineSeconds(elapsedSeconds: number): number {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return 0
  }

  return Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS)
}

export function clampPoints(points: number): number {
  if (!Number.isFinite(points) || points < 0) {
    return 0
  }

  return Math.min(points, MAX_STORED_POINTS)
}

export function clampProductionPerSecond(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0
  }

  return Math.min(value, MAX_PRODUCTION_PER_SECOND)
}

export function sanitizeUpgradeLevels(upgrades: UpgradeLevels): UpgradeLevels {
  return upgradeDefinitions.reduce((safeUpgrades, definition) => {
    const savedLevel = upgrades[definition.id]?.level ?? 0
    const level = Math.min(
      definition.maxLevel,
      Math.max(0, Math.floor(Number.isFinite(savedLevel) ? savedLevel : 0)),
    )

    safeUpgrades[definition.id] = {
      id: definition.id,
      level,
    }

    return safeUpgrades
  }, {} as UpgradeLevels)
}

export function sanitizeMetrics(metrics: GameMetrics): GameMetrics {
  return {
    elapsedSeconds: Math.max(0, metrics.elapsedSeconds || 0),
    lifetimePoints: clampPoints(metrics.lifetimePoints),
    manualClicks: Math.max(0, Math.floor(metrics.manualClicks || 0)),
    totalUpgrades: Math.max(0, Math.floor(metrics.totalUpgrades || 0)),
    ordersCompleted: Math.max(0, Math.floor(metrics.ordersCompleted || 0)),
    bestProductionPerSecond: clampProductionPerSecond(
      metrics.bestProductionPerSecond,
    ),
    totalPieces: Math.max(0, metrics.totalPieces || 0),
    goodPieces: Math.max(0, metrics.goodPieces || 0),
    defectivePieces: Math.max(0, metrics.defectivePieces || 0),
    downtimeSeconds: Math.max(0, metrics.downtimeSeconds || 0),
    offlinePoints: Math.max(0, metrics.offlinePoints || 0),
    lastOfflineSeconds: Math.max(0, metrics.lastOfflineSeconds || 0),
  }
}

export function sanitizeHistory(history?: ProductionSample[]): ProductionSample[] {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter((sample) => Number.isFinite(sample.timestamp))
    .slice(-30)
    .map((sample) => ({
      timestamp: Math.max(0, sample.timestamp),
      goodPieces: Math.max(0, sample.goodPieces || 0),
      defectivePieces: Math.max(0, sample.defectivePieces || 0),
      productionPerMinute: clampProductionPerSecond(
        (sample.productionPerMinute || 0) / 60,
      ) * 60,
      defectsPerMinute: clampProductionPerSecond(
        (sample.defectsPerMinute || 0) / 60,
      ) * 60,
      oee: Math.min(1, Math.max(0, sample.oee || 0)),
    }))
}

export function sanitizeSavedGame(
  savedGame: PersistedGameState,
): PersistedGameState {
  const savedAt = Number.isFinite(savedGame.savedAt) ? savedGame.savedAt : Date.now()
  const safeSavedAt = Math.min(savedAt, Date.now() + 60_000)

  return {
    points: clampPoints(savedGame.points),
    upgrades: sanitizeUpgradeLevels(savedGame.upgrades),
    metrics: sanitizeMetrics(savedGame.metrics),
    history: sanitizeHistory(savedGame.history),
    isPaused: Boolean(savedGame.isPaused),
    savedAt: safeSavedAt,
  }
}
