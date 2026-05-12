import type { UpgradeDefinition, UpgradeLevels } from '../../types/game'

export const UPGRADE_COST_MULTIPLIER = 1.5
export const MAX_UPGRADE_LEVEL = 5

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

export function getUpgradeLevel(
  upgrades: UpgradeLevels,
  definition: UpgradeDefinition,
): number {
  return upgrades[definition.id].level
}
