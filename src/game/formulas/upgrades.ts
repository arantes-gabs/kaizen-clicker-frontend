import type { UpgradeDefinition, UpgradeLevels } from '../../types/game'

const BASE_CLICK_POWER = 1
const MANUAL_LEVEL_BONUS = 0.25
const FLOW_CLICK_BONUS = 0.1

export function getUpgradeCost(
  definition: UpgradeDefinition,
  currentLevel: number,
): number {
  return Math.ceil(
    definition.baseCost * Math.pow(definition.costMultiplier, currentLevel),
  )
}

export function getUpgradeOutput(
  definition: UpgradeDefinition,
  level: number,
): number {
  if (level <= 0) {
    return 0
  }

  const continuousImprovementBonus = 1 + Math.max(0, level - 1) * 0.08
  return definition.baseOutput * level * continuousImprovementBonus
}

export function getNextUpgradeOutput(
  definition: UpgradeDefinition,
  currentLevel: number,
): number {
  return (
    getUpgradeOutput(definition, currentLevel + 1) -
    getUpgradeOutput(definition, currentLevel)
  )
}

export function getProductionPerSecond(
  upgrades: UpgradeLevels,
  definitions: readonly UpgradeDefinition[],
): number {
  return definitions.reduce((total, definition) => {
    return total + getUpgradeOutput(definition, upgrades[definition.id].level)
  }, 0)
}

export function getClickPower(upgrades: UpgradeLevels): number {
  return (
    BASE_CLICK_POWER +
    upgrades.handPress.level * MANUAL_LEVEL_BONUS +
    upgrades.kanbanRack.level * FLOW_CLICK_BONUS
  )
}
