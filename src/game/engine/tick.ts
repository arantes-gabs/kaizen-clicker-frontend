const MAX_TICK_SECONDS = 5

export function clampTickDelta(deltaSeconds: number): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
    return 0
  }

  return Math.min(deltaSeconds, MAX_TICK_SECONDS)
}

export function resolveProductionTick(
  points: number,
  productionPerSecond: number,
  deltaSeconds: number,
): number {
  return points + productionPerSecond * clampTickDelta(deltaSeconds)
}

export function resolveManualClick(points: number, clickPower: number): number {
  return points + clickPower
}
