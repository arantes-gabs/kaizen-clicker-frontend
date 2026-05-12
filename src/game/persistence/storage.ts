import type { PersistedGameState } from '../../types/game'

const STORAGE_KEY = 'kaizen-clicker:save-v1'

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
    return JSON.parse(savedState) as PersistedGameState
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
