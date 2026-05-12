import { sanitizeSavedGame } from '../antiCheat/limits'
import type { PersistedGameState } from '../../types/game'

const STORAGE_KEY = 'kaizen-clicker:save-v2'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && 'localStorage' in window
}

export function loadGame(): PersistedGameState | null {
  if (!canUseStorage()) {
    return null
  }

  const savedState = window.localStorage.getItem(STORAGE_KEY)

  if (!savedState) {
    return null
  }

  try {
    return sanitizeSavedGame(JSON.parse(savedState) as PersistedGameState)
  } catch {
    return null
  }
}

export function saveGame(state: PersistedGameState): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, savedAt: Date.now() }),
  )
}
