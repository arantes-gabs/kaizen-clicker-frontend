import type { UpgradeDefinition } from '../../types/game'

const UPGRADE_COST_MULTIPLIER = 1.5

export function getUpgradeCost(
  definition: UpgradeDefinition,
  currentLevel: number,
): number {
  if (currentLevel >= definition.maxLevel) {
    return Number.POSITIVE_INFINITY
  }

  return Math.ceil(
    definition.baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, currentLevel),
  )
}

export function canPurchaseUpgrade(
  definition: UpgradeDefinition,
  currentLevel: number,
  points: number,
): boolean {
  return (
    currentLevel < definition.maxLevel &&
    points >= getUpgradeCost(definition, currentLevel)
  )
}

