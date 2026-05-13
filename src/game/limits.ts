export const MAX_OFFLINE_SECONDS = 8 * 60 * 60
export const MAX_STORED_POINTS = 1_000_000_000_000
export const MAX_PRODUCTION_PER_SECOND = 1_000

function isNonNegativeFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

export function clampOfflineSeconds(elapsedSeconds: number): number {
  if (!isNonNegativeFiniteNumber(elapsedSeconds)) {
    return 0
  }

  return Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS)
}

export function clampPoints(points: number): number {
  if (!isNonNegativeFiniteNumber(points)) {
    return 0
  }

  return Math.min(points, MAX_STORED_POINTS)
}

export function clampProductionPerSecond(value: number): number {
  if (!isNonNegativeFiniteNumber(value)) {
    return 0
  }

  return Math.min(value, MAX_PRODUCTION_PER_SECOND)
}
