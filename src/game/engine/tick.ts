import type { FactoryMetrics } from '../../types/game'
import { clampProductionPerSecond } from '../limits'

export interface ProductionResult {
  elapsedSeconds: number
  producedPieces: number
  goodPieces: number
  defectivePieces: number
  downtimeSeconds: number
  pointsGained: number
}

export function resolveOfflineProduction(
  factory: FactoryMetrics,
  elapsedSeconds: number,
): ProductionResult {
  const producedPerSecond = clampProductionPerSecond(
    factory.producedPiecesPerSecond,
  )
  const producedPieces = producedPerSecond * elapsedSeconds
  const goodPieces = producedPieces * factory.quality
  const defectivePieces = producedPieces * factory.defectRate

  return {
    elapsedSeconds,
    producedPieces,
    goodPieces,
    defectivePieces,
    downtimeSeconds: elapsedSeconds * factory.downtimeRate,
    pointsGained: goodPieces,
  }
}

export function resolveManualClick(clickPower: number): ProductionResult {
  return {
    elapsedSeconds: 0,
    producedPieces: clickPower,
    goodPieces: clickPower,
    defectivePieces: 0,
    downtimeSeconds: 0,
    pointsGained: clickPower,
  }
}
