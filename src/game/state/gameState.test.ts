import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_OFFLINE_SECONDS } from '../limits'
import { resolveOfflineProduction } from '../engine/tick'
import { getFactoryMetrics } from '../formulas/factory'
import { createInitialGameState, createUpgradeLevels } from './gameState'
import { makePersistedGameState } from '../../test/makePersistedGameState'

const NOW = new Date('2026-01-01T12:00:00Z')

describe('initial game state restore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('applies offline production from the saved timestamp', () => {
    const elapsedSeconds = 60
    const savedGame = makePersistedGameState({
      points: 100,
      savedAt: Date.now() - elapsedSeconds * 1_000,
    })
    const state = createInitialGameState({
      state: savedGame,
      integrityNotice: null,
    })
    const factory = getFactoryMetrics(createUpgradeLevels())
    const expectedProduction = resolveOfflineProduction(factory, elapsedSeconds)

    expect(state.metrics.lastOfflineSeconds).toBe(elapsedSeconds)
    expect(state.points).toBeCloseTo(
      savedGame.points + expectedProduction.pointsGained,
    )
    expect(state.metrics.offlinePoints).toBeCloseTo(
      expectedProduction.pointsGained,
    )
  })

  it('truncates offline production above 8 hours', () => {
    const savedGame = makePersistedGameState({
      points: 100,
      savedAt: Date.now() - (MAX_OFFLINE_SECONDS + 3_600) * 1_000,
    })
    const state = createInitialGameState({
      state: savedGame,
      integrityNotice: null,
    })
    const factory = getFactoryMetrics(createUpgradeLevels())
    const expectedProduction = resolveOfflineProduction(
      factory,
      MAX_OFFLINE_SECONDS,
    )

    expect(state.metrics.lastOfflineSeconds).toBe(MAX_OFFLINE_SECONDS)
    expect(state.points).toBeCloseTo(
      savedGame.points + expectedProduction.pointsGained,
    )
  })

  it('does not apply offline production while paused', () => {
    const savedGame = makePersistedGameState({
      points: 100,
      isPaused: true,
      savedAt: Date.now() - 60_000,
    })
    const state = createInitialGameState({
      state: savedGame,
      integrityNotice: null,
    })

    expect(state.points).toBe(100)
    expect(state.metrics.lastOfflineSeconds).toBe(0)
    expect(state.metrics.offlinePoints).toBe(0)
  })
})
