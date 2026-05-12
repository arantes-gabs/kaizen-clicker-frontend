import type { FactoryMetrics, UpgradeLevels } from '../../types/game'

const BASE_PRODUCTION_PER_SECOND = 1
const BASE_DEFECT_RATE = 0.3
const BASE_MAX_AVAILABILITY = 0.86
const BASE_DOWNTIME_PENALTY = 0.06
const BASE_PERFORMANCE_BEFORE_FLUCTUATION = 0.7936507937
const BASE_FLUCTUATION_PENALTY = 0.1
const JIT_DEFECT_THRESHOLD = 0.05

function clampRate(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(1, Math.max(0, value))
}

function level(upgrades: UpgradeLevels, id: keyof UpgradeLevels): number {
  return upgrades[id].level
}

export function getDefectRate(upgrades: UpgradeLevels): number {
  const defectRate =
    BASE_DEFECT_RATE *
    Math.pow(0.95, level(upgrades, 'fiveS')) *
    Math.pow(0.85, level(upgrades, 'pokaYoke')) *
    Math.pow(0.9, level(upgrades, 'tpm')) *
    Math.pow(0.6, level(upgrades, 'jidoka'))

  return clampRate(defectRate)
}

export function getRawProductionPerSecond(
  upgrades: UpgradeLevels,
  defectRate: number,
): number {
  const justInTimeLevel = level(upgrades, 'justInTime')
  const justInTimeMultiplier =
    defectRate < JIT_DEFECT_THRESHOLD ? Math.pow(1.5, justInTimeLevel) : 1

  return (
    BASE_PRODUCTION_PER_SECOND *
    Math.pow(1.1, level(upgrades, 'fiveS')) *
    Math.pow(1.2, level(upgrades, 'kanban')) *
    Math.pow(0.9, level(upgrades, 'jidoka')) *
    justInTimeMultiplier
  )
}

export function getAvailability(upgrades: UpgradeLevels): number {
  const downtimePenalty =
    BASE_DOWNTIME_PENALTY * Math.pow(0.65, level(upgrades, 'andon'))
  const maintenanceBoost = 1 + level(upgrades, 'tpm') * 0.15

  return clampRate((BASE_MAX_AVAILABILITY - downtimePenalty) * maintenanceBoost)
}

export function getFluctuationPenalty(upgrades: UpgradeLevels): number {
  return BASE_FLUCTUATION_PENALTY * Math.max(0, 1 - level(upgrades, 'heijunka') * 0.18)
}

export function getPerformance(upgrades: UpgradeLevels): number {
  const leveledFlowBoost = 1 + level(upgrades, 'heijunka') * 0.25
  const fluctuationPenalty = getFluctuationPenalty(upgrades)

  return clampRate(
    BASE_PERFORMANCE_BEFORE_FLUCTUATION *
      (1 - fluctuationPenalty) *
      leveledFlowBoost,
  )
}

export function getOee(
  availability: number,
  performance: number,
  quality: number,
): number {
  return clampRate(availability) * clampRate(performance) * clampRate(quality)
}

export function getFactoryMetrics(upgrades: UpgradeLevels): FactoryMetrics {
  const defectRate = getDefectRate(upgrades)
  const rawProductionPerSecond = getRawProductionPerSecond(upgrades, defectRate)
  const availability = getAvailability(upgrades)
  const performance = getPerformance(upgrades)
  const quality = clampRate(1 - defectRate)
  const oee = getOee(availability, performance, quality)
  const producedPiecesPerSecond =
    rawProductionPerSecond * availability * performance

  return {
    rawProductionPerSecond,
    effectiveProductionPerSecond: rawProductionPerSecond * oee,
    producedPiecesPerSecond,
    defectivePiecesPerSecond: producedPiecesPerSecond * defectRate,
    defectRate,
    availability,
    performance,
    quality,
    oee,
    downtimeRate: clampRate(1 - availability),
    fluctuationPenalty: getFluctuationPenalty(upgrades),
    isJustInTimeActive:
      defectRate < JIT_DEFECT_THRESHOLD && level(upgrades, 'justInTime') > 0,
  }
}
