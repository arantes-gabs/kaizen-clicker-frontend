import { describe, expect, it } from 'vitest'
import {
  MAX_OFFLINE_SECONDS,
  clampOfflineSeconds,
  clampPoints,
  clampProductionPerSecond,
} from './limits'

describe('game limits', () => {
  it('caps offline time at 8 hours', () => {
    expect(clampOfflineSeconds(MAX_OFFLINE_SECONDS + 60)).toBe(
      MAX_OFFLINE_SECONDS,
    )
  })

  it('rejects invalid negative values before applying gameplay math', () => {
    expect(clampOfflineSeconds(-1)).toBe(0)
    expect(clampPoints(Number.NaN)).toBe(0)
    expect(clampProductionPerSecond(Number.POSITIVE_INFINITY)).toBe(0)
  })
})
