import { create } from 'zustand'
import {
  resolveManualClick,
  resolveOfflineProduction,
  resolveProductionTick,
  type ProductionResult,
} from '../game/engine/tick'
import {
  clampOfflineSeconds,
  clampPoints,
  sanitizeHistory,
  sanitizeMetrics,
} from '../game/antiCheat/limits'
import { getFactoryMetrics } from '../game/formulas/factory'
import {
  canPurchaseUpgrade,
  getUpgradeCost,
} from '../game/formulas/upgrades'
import { loadGame, saveGame } from '../game/persistence/storage'
import { upgradeDefinitions } from '../services/gameCatalog'
import type {
  GameMetrics,
  FactoryMetrics,
  PersistedGameState,
  ProductionSample,
  UpgradeId,
  UpgradeLevels,
} from '../types/game'

interface GameStore {
  points: number
  productionPerSecond: number
  clickPower: number
  factory: FactoryMetrics
  upgrades: UpgradeLevels
  metrics: GameMetrics
  history: ProductionSample[]
  lastSampledAt: number
  isPaused: boolean
  clickFactory: () => void
  purchaseUpgrade: (id: UpgradeId) => void
  tick: (deltaSeconds: number) => void
  togglePause: () => void
}

const defaultMetrics: GameMetrics = {
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

const MANUAL_CLICK_POWER = 1
const AUTOSAVE_INTERVAL_MS = 2_000

function createUpgradeLevels(savedUpgrades?: UpgradeLevels): UpgradeLevels {
  return upgradeDefinitions.reduce((levels, definition) => {
    levels[definition.id] = {
      id: definition.id,
      level: savedUpgrades?.[definition.id]?.level ?? 0,
    }

    return levels
  }, {} as UpgradeLevels)
}

function getDerivedValues(upgrades: UpgradeLevels): FactoryMetrics {
  return getFactoryMetrics(upgrades)
}

function getOrdersCompleted(goodPieces: number): number {
  return Math.floor(goodPieces / 100)
}

function applyProductionResult(
  metrics: GameMetrics,
  result: ProductionResult,
): GameMetrics {
  const goodPieces = metrics.goodPieces + result.goodPieces
  const lifetimePoints = metrics.lifetimePoints + result.pointsGained

  return {
    ...metrics,
    elapsedSeconds: metrics.elapsedSeconds + result.elapsedSeconds,
    lifetimePoints,
    totalPieces: metrics.totalPieces + result.producedPieces,
    goodPieces,
    defectivePieces: metrics.defectivePieces + result.defectivePieces,
    downtimeSeconds: metrics.downtimeSeconds + result.downtimeSeconds,
    ordersCompleted: getOrdersCompleted(goodPieces),
  }
}

function serializeGameState(state: GameStore): PersistedGameState {
  return {
    points: state.points,
    upgrades: state.upgrades,
    metrics: state.metrics,
    history: state.history,
    isPaused: state.isPaused,
    savedAt: Date.now(),
  }
}

let pendingSaveState: PersistedGameState | null = null
let saveTimerId: number | null = null
let lastSavedAt = Date.now()

function flushPendingSave(): void {
  if (!pendingSaveState) {
    return
  }

  if (saveTimerId !== null) {
    window.clearTimeout(saveTimerId)
    saveTimerId = null
  }

  saveGame(pendingSaveState)
  pendingSaveState = null
  lastSavedAt = Date.now()
}

function scheduleGameSave(state: GameStore): void {
  pendingSaveState = serializeGameState(state)

  if (typeof window === 'undefined') {
    saveGame(pendingSaveState)
    pendingSaveState = null
    return
  }

  const elapsedSinceLastSave = Date.now() - lastSavedAt

  if (elapsedSinceLastSave >= AUTOSAVE_INTERVAL_MS) {
    flushPendingSave()
    return
  }

  if (saveTimerId !== null) {
    return
  }

  saveTimerId = window.setTimeout(
    flushPendingSave,
    AUTOSAVE_INTERVAL_MS - elapsedSinceLastSave,
  )
}

function registerAutosaveFlush(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.addEventListener('pagehide', flushPendingSave)
  window.addEventListener('beforeunload', flushPendingSave)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingSave()
    }
  })
}

function createProductionSample(
  metrics: GameMetrics,
  factory: FactoryMetrics,
  previousSample: ProductionSample | undefined,
): ProductionSample {
  const now = Date.now()
  const elapsedMinutes = previousSample
    ? Math.max((now - previousSample.timestamp) / 60_000, 1 / 60)
    : 1
  const goodDelta = previousSample
    ? Math.max(0, metrics.goodPieces - previousSample.goodPieces)
    : metrics.goodPieces
  const defectDelta = previousSample
    ? Math.max(0, metrics.defectivePieces - previousSample.defectivePieces)
    : metrics.defectivePieces

  return {
    timestamp: now,
    goodPieces: metrics.goodPieces,
    defectivePieces: metrics.defectivePieces,
    productionPerMinute: goodDelta / elapsedMinutes,
    defectsPerMinute: defectDelta / elapsedMinutes,
    oee: factory.oee,
  }
}

function maybeAddProductionSample(
  history: ProductionSample[],
  metrics: GameMetrics,
  factory: FactoryMetrics,
  lastSampledAt: number,
): { history: ProductionSample[]; lastSampledAt: number } {
  const now = Date.now()

  if (now - lastSampledAt < 2_000) {
    return { history, lastSampledAt }
  }

  const sample = createProductionSample(
    metrics,
    factory,
    history[history.length - 1],
  )

  return {
    history: [...history, sample].slice(-30),
    lastSampledAt: now,
  }
}

const savedGame = loadGame()
const initialUpgrades = createUpgradeLevels(savedGame?.upgrades)
const initialDerivedValues = getDerivedValues(initialUpgrades)
const initialOfflineSeconds =
  savedGame && !savedGame.isPaused
    ? clampOfflineSeconds((Date.now() - savedGame.savedAt) / 1000)
    : 0
const initialOfflineProduction =
  initialOfflineSeconds > 0
    ? resolveOfflineProduction(initialDerivedValues, initialOfflineSeconds)
    : null
const restoredMetrics = sanitizeMetrics(savedGame?.metrics ?? defaultMetrics)
const restoredHistory = sanitizeHistory(savedGame?.history)
const initialMetrics = initialOfflineProduction
  ? {
      ...applyProductionResult(restoredMetrics, initialOfflineProduction),
      offlinePoints:
        restoredMetrics.offlinePoints + initialOfflineProduction.pointsGained,
      lastOfflineSeconds: initialOfflineSeconds,
      bestProductionPerSecond: Math.max(
        restoredMetrics.bestProductionPerSecond,
        initialDerivedValues.effectiveProductionPerSecond,
      ),
    }
  : restoredMetrics

export const useGameStore = create<GameStore>((set) => ({
  points: clampPoints(
    (savedGame?.points ?? 0) + (initialOfflineProduction?.pointsGained ?? 0),
  ),
  productionPerSecond: initialDerivedValues.effectiveProductionPerSecond,
  clickPower: MANUAL_CLICK_POWER,
  factory: initialDerivedValues,
  upgrades: initialUpgrades,
  metrics: initialMetrics,
  history: restoredHistory,
  lastSampledAt: Date.now(),
  isPaused: savedGame?.isPaused ?? false,

  clickFactory: () => {
    set((state) => {
      if (state.isPaused) {
        return {}
      }

      const result = resolveManualClick(state.clickPower)
      const metrics = applyProductionResult(state.metrics, result)
      const sampled = maybeAddProductionSample(
        state.history,
        metrics,
        state.factory,
        state.lastSampledAt,
      )

      return {
        points: clampPoints(state.points + result.pointsGained),
        history: sampled.history,
        lastSampledAt: sampled.lastSampledAt,
        metrics: {
          ...metrics,
          manualClicks: state.metrics.manualClicks + 1,
        },
      }
    })
  },

  purchaseUpgrade: (id) => {
    set((state) => {
      const definition = upgradeDefinitions.find((upgrade) => upgrade.id === id)

      if (!definition) {
        return {}
      }

      const currentUpgrade = state.upgrades[id]

      if (!canPurchaseUpgrade(definition, currentUpgrade.level, state.points)) {
        return {}
      }

      const cost = getUpgradeCost(definition, currentUpgrade.level)

      const upgrades: UpgradeLevels = {
        ...state.upgrades,
        [id]: { ...currentUpgrade, level: currentUpgrade.level + 1 },
      }
      const derivedValues = getDerivedValues(upgrades)

      return {
        points: clampPoints(state.points - cost),
        upgrades,
        factory: derivedValues,
        productionPerSecond: derivedValues.effectiveProductionPerSecond,
        clickPower: MANUAL_CLICK_POWER,
        metrics: {
          ...state.metrics,
          totalUpgrades: state.metrics.totalUpgrades + 1,
          bestProductionPerSecond: Math.max(
            state.metrics.bestProductionPerSecond,
            derivedValues.effectiveProductionPerSecond,
          ),
        },
      }
    })
  },

  tick: (deltaSeconds) => {
    set((state) => {
      if (state.isPaused || state.productionPerSecond <= 0) {
        return {}
      }

      const result = resolveProductionTick(state.factory, deltaSeconds)
      const metrics = applyProductionResult(state.metrics, result)
      const sampled = maybeAddProductionSample(
        state.history,
        metrics,
        state.factory,
        state.lastSampledAt,
      )

      return {
        points: clampPoints(state.points + result.pointsGained),
        history: sampled.history,
        lastSampledAt: sampled.lastSampledAt,
        metrics: {
          ...metrics,
          bestProductionPerSecond: Math.max(
            state.metrics.bestProductionPerSecond,
            state.productionPerSecond,
          ),
        },
      }
    })
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }))
  },
}))

useGameStore.subscribe(scheduleGameSave)
registerAutosaveFlush()
