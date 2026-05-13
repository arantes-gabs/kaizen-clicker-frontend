import type { StateCreator } from 'zustand'
import { clampOfflineSeconds, clampPoints } from '../game/antiCheat/limits'
import {
  applyProductionResult,
  maybeAddProductionSample,
} from '../game/engine/progress'
import {
  resolveManualClick,
  resolveOfflineProduction,
} from '../game/engine/tick'
import { getFactoryMetrics } from '../game/formulas/factory'
import {
  canPurchaseUpgrade,
  getUpgradeCost,
} from '../game/formulas/upgrades'
import { MANUAL_CLICK_POWER } from '../game/state/gameState'
import { upgradeDefinitions } from '../services/gameCatalog'
import type { UpgradeLevels } from '../types/game'
import type { GameActions, GameStore } from './gameStoreTypes'

type SetGameStore = Parameters<StateCreator<GameStore>>[0]

export function createGameActions(set: SetGameStore): GameActions {
  return {
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
        const factory = getFactoryMetrics(upgrades)

        return {
          points: clampPoints(state.points - cost),
          upgrades,
          factory,
          productionPerSecond: factory.effectiveProductionPerSecond,
          clickPower: MANUAL_CLICK_POWER,
          metrics: {
            ...state.metrics,
            totalUpgrades: state.metrics.totalUpgrades + 1,
            bestProductionPerSecond: Math.max(
              state.metrics.bestProductionPerSecond,
              factory.effectiveProductionPerSecond,
            ),
          },
        }
      })
    },

    tick: (deltaSeconds) => {
      set((state) => {
        const elapsedSeconds = clampOfflineSeconds(deltaSeconds)

        if (
          state.isPaused ||
          state.productionPerSecond <= 0 ||
          elapsedSeconds <= 0
        ) {
          return {}
        }

        const result = resolveOfflineProduction(state.factory, elapsedSeconds)
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

    dismissIntegrityNotice: () => {
      set({ integrityNotice: null })
    },
  }
}
