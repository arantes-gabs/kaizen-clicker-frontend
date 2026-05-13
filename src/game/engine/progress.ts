import type {
  FactoryMetrics,
  GameMetrics,
  ProductionSample,
} from '../../types/game'
import type { ProductionResult } from './tick'

function getOrdersCompleted(goodPieces: number): number {
  return Math.floor(goodPieces / 100)
}

export function applyProductionResult(
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

export function maybeAddProductionSample(
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
