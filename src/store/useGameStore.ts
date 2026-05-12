import { create } from 'zustand'
import { resolveManualClick, resolveProductionTick } from '../game/engine/tick'
import {
  getClickPower,
  getProductionPerSecond,
  getUpgradeCost,
} from '../game/formulas/upgrades'
import { loadGame, saveGame } from '../game/persistence/storage'
import { upgradeDefinitions } from '../services/gameCatalog'
import type {
  GameMetrics,
  PersistedGameState,
  UpgradeId,
  UpgradeLevels,
} from '../types/game'

interface GameStore {
  points: number
  productionPerSecond: number
  clickPower: number
  upgrades: UpgradeLevels
  metrics: GameMetrics
  isPaused: boolean
  clickFactory: () => void
  purchaseUpgrade: (id: UpgradeId) => void
  tick: (deltaSeconds: number) => void
  togglePause: () => void
}

const defaultMetrics: GameMetrics = {
  lifetimePoints: 0,
  manualClicks: 0,
  totalUpgrades: 0,
  ordersCompleted: 0,
  bestProductionPerSecond: 0,
}

function createUpgradeLevels(savedUpgrades?: UpgradeLevels): UpgradeLevels {
  return upgradeDefinitions.reduce((levels, definition) => {
    levels[definition.id] = {
      id: definition.id,
      level: savedUpgrades?.[definition.id]?.level ?? 0,
    }

    return levels
  }, {} as UpgradeLevels)
}

function getDerivedValues(upgrades: UpgradeLevels): {
  productionPerSecond: number
  clickPower: number
} {
  return {
    productionPerSecond: getProductionPerSecond(upgrades, upgradeDefinitions),
    clickPower: getClickPower(upgrades),
  }
}

function getOrdersCompleted(lifetimePoints: number): number {
  return Math.floor(lifetimePoints / 100)
}

function serializeGameState(state: GameStore): PersistedGameState {
  return {
    points: state.points,
    upgrades: state.upgrades,
    metrics: state.metrics,
    isPaused: state.isPaused,
    savedAt: Date.now(),
  }
}

const savedGame = loadGame()
const initialUpgrades = createUpgradeLevels(savedGame?.upgrades)
const initialDerivedValues = getDerivedValues(initialUpgrades)

export const useGameStore = create<GameStore>((set) => ({
  points: savedGame?.points ?? 30,
  productionPerSecond: initialDerivedValues.productionPerSecond,
  clickPower: initialDerivedValues.clickPower,
  upgrades: initialUpgrades,
  metrics: savedGame?.metrics ?? defaultMetrics,
  isPaused: savedGame?.isPaused ?? false,

  clickFactory: () => {
    set((state) => {
      if (state.isPaused) {
        return {}
      }

      const nextPoints = resolveManualClick(state.points, state.clickPower)
      const lifetimePoints = state.metrics.lifetimePoints + state.clickPower

      return {
        points: nextPoints,
        metrics: {
          ...state.metrics,
          lifetimePoints,
          manualClicks: state.metrics.manualClicks + 1,
          ordersCompleted: getOrdersCompleted(lifetimePoints),
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
      const cost = getUpgradeCost(definition, currentUpgrade.level)

      if (state.points < cost) {
        return {}
      }

      const upgrades: UpgradeLevels = {
        ...state.upgrades,
        [id]: { ...currentUpgrade, level: currentUpgrade.level + 1 },
      }
      const derivedValues = getDerivedValues(upgrades)

      return {
        points: state.points - cost,
        upgrades,
        productionPerSecond: derivedValues.productionPerSecond,
        clickPower: derivedValues.clickPower,
        metrics: {
          ...state.metrics,
          totalUpgrades: state.metrics.totalUpgrades + 1,
          bestProductionPerSecond: Math.max(
            state.metrics.bestProductionPerSecond,
            derivedValues.productionPerSecond,
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

      const nextPoints = resolveProductionTick(
        state.points,
        state.productionPerSecond,
        deltaSeconds,
      )
      const gainedPoints = nextPoints - state.points
      const lifetimePoints = state.metrics.lifetimePoints + gainedPoints

      return {
        points: nextPoints,
        metrics: {
          ...state.metrics,
          lifetimePoints,
          ordersCompleted: getOrdersCompleted(lifetimePoints),
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

useGameStore.subscribe((state) => {
  saveGame(serializeGameState(state))
})
