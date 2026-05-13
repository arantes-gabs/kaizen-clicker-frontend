import type { StoreApi, UseBoundStore } from 'zustand'
import {
  clearSavedGame,
  getStoredGameIntegrityNotice,
  saveGame,
} from '../game/persistence/storage'
import {
  createFreshGameState,
  serializeGameState,
} from '../game/state/gameState'
import type { PersistedGameState } from '../types/game'
import type { GameStore } from './gameStoreTypes'

const AUTOSAVE_INTERVAL_MS = 2_000
const SAVE_INTEGRITY_CHECK_MS = 500

type GameStoreApi = UseBoundStore<StoreApi<GameStore>>

let pendingSaveState: PersistedGameState | null = null
let saveTimerId: number | null = null
let lastSavedAt = Date.now()
let isPersistenceRegistered = false

function resetPendingSave(): void {
  pendingSaveState = null

  if (saveTimerId !== null) {
    window.clearTimeout(saveTimerId)
    saveTimerId = null
  }
}

function resetGameAfterIntegrityFailure(
  store: GameStoreApi,
  integrityNotice: string,
): void {
  resetPendingSave()
  clearSavedGame()
  lastSavedAt = Date.now()
  store.setState(createFreshGameState(integrityNotice))
}

function flushPendingSave(store: GameStoreApi): void {
  if (!pendingSaveState) {
    return
  }

  if (saveTimerId !== null) {
    window.clearTimeout(saveTimerId)
    saveTimerId = null
  }

  const integrityNotice = getStoredGameIntegrityNotice()

  if (integrityNotice) {
    resetGameAfterIntegrityFailure(store, integrityNotice)
    return
  }

  saveGame(pendingSaveState)
  pendingSaveState = null
  lastSavedAt = Date.now()
}

function scheduleGameSave(store: GameStoreApi, state: GameStore): void {
  pendingSaveState = serializeGameState(state)

  if (typeof window === 'undefined') {
    saveGame(pendingSaveState)
    pendingSaveState = null
    return
  }

  const elapsedSinceLastSave = Date.now() - lastSavedAt

  if (elapsedSinceLastSave >= AUTOSAVE_INTERVAL_MS) {
    flushPendingSave(store)
    return
  }

  if (saveTimerId !== null) {
    return
  }

  saveTimerId = window.setTimeout(
    () => flushPendingSave(store),
    AUTOSAVE_INTERVAL_MS - elapsedSinceLastSave,
  )
}

function registerAutosaveFlush(store: GameStoreApi): void {
  if (typeof window === 'undefined') {
    return
  }

  window.addEventListener('pagehide', () => flushPendingSave(store))
  window.addEventListener('beforeunload', () => flushPendingSave(store))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingSave(store)
    }
  })
}

function registerSaveIntegrityWatcher(store: GameStoreApi): void {
  if (typeof window === 'undefined') {
    return
  }

  window.setInterval(() => {
    const integrityNotice = getStoredGameIntegrityNotice()

    if (integrityNotice) {
      resetGameAfterIntegrityFailure(store, integrityNotice)
    }
  }, SAVE_INTEGRITY_CHECK_MS)
}

export function registerGameStorePersistence(store: GameStoreApi): void {
  if (isPersistenceRegistered) {
    return
  }

  isPersistenceRegistered = true
  store.subscribe((state) => scheduleGameSave(store, state))
  registerAutosaveFlush(store)
  registerSaveIntegrityWatcher(store)
}
