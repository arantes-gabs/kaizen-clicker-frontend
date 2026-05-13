import type { PersistedGameState } from '../../types/game'
import {
  createSaveEnvelope,
  parseSaveEnvelope,
  type SaveIntegrityIssue,
} from './integrity'

const STORAGE_KEY = 'kaizen-clicker:save-v2'
const INTEGRITY_NOTICES: Record<SaveIntegrityIssue, string> = {
  checksum:
    'Detectamos uma alteracao manual no save local. O progresso foi reiniciado.',
  corrupted: 'O save local estava corrompido e o progresso foi reiniciado.',
  'invalid-format':
    'O save local estava em formato invalido e o progresso foi reiniciado.',
}

export interface LoadedGame {
  state: PersistedGameState | null
  integrityNotice: string | null
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && 'localStorage' in window
}

function emptyLoadedGame(): LoadedGame {
  return { state: null, integrityNotice: null }
}

function resetInvalidSave(integrityNotice: string): LoadedGame {
  clearSavedGame()

  return { state: null, integrityNotice }
}

function readStoredGame(): LoadedGame {
  if (!canUseStorage()) {
    return emptyLoadedGame()
  }

  const savedState = window.localStorage.getItem(STORAGE_KEY)

  if (!savedState) {
    return emptyLoadedGame()
  }

  const parsedSave = parseSaveEnvelope(savedState)

  if (parsedSave.issue) {
    return {
      state: null,
      integrityNotice: INTEGRITY_NOTICES[parsedSave.issue],
    }
  }

  return {
    state: parsedSave.state,
    integrityNotice: null,
  }
}

export function clearSavedGame(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

export function getStoredGameIntegrityNotice(): string | null {
  return readStoredGame().integrityNotice
}

export function loadGame(): LoadedGame {
  const loadedGame = readStoredGame()

  if (loadedGame.integrityNotice) {
    return resetInvalidSave(loadedGame.integrityNotice)
  }

  return loadedGame
}

export function saveGame(state: PersistedGameState): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(createSaveEnvelope(state)),
  )
}
