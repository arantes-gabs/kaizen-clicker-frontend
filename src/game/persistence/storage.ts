import {
  isValidSavedGameIntegrity,
  sanitizeSavedGame,
} from '../antiCheat/limits'
import type { PersistedGameState } from '../../types/game'

const STORAGE_KEY = 'kaizen-clicker:save-v2'
const SAVE_VERSION = 2
const CHECKSUM_PREFIX = 'kaizen-clicker-save-v2'
const CORRUPTED_SAVE_NOTICE =
  'O save local estava corrompido e o progresso foi reiniciado.'
const INVALID_FORMAT_NOTICE =
  'O save local estava em formato invalido e o progresso foi reiniciado.'
const CHECKSUM_NOTICE =
  'Detectamos uma alteracao manual no save local. O progresso foi reiniciado.'
const INCONSISTENT_SAVE_NOTICE =
  'O save local tinha dados inconsistentes e o progresso foi reiniciado.'

interface StoredGameEnvelope {
  version: typeof SAVE_VERSION
  state: PersistedGameState
  checksum: string
}

export interface LoadedGame {
  state: PersistedGameState | null
  integrityNotice: string | null
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && 'localStorage' in window
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null'
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }

  const record = value as Record<string, unknown>

  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`
}

function createChecksum(value: unknown): string {
  const input = `${CHECKSUM_PREFIX}:${stableStringify(value)}`
  let hash = 2_166_136_261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}

function createEnvelope(state: PersistedGameState): StoredGameEnvelope {
  return {
    version: SAVE_VERSION,
    state,
    checksum: createChecksum(state),
  }
}

function resetInvalidSave(integrityNotice: string): LoadedGame {
  clearSavedGame()

  return { state: null, integrityNotice }
}

function readStoredGame(): LoadedGame {
  if (!canUseStorage()) {
    return { state: null, integrityNotice: null }
  }

  const savedState = window.localStorage.getItem(STORAGE_KEY)

  if (!savedState) {
    return { state: null, integrityNotice: null }
  }

  let parsedState: unknown

  try {
    parsedState = JSON.parse(savedState) as unknown
  } catch {
    return { state: null, integrityNotice: CORRUPTED_SAVE_NOTICE }
  }

  if (
    !isRecord(parsedState) ||
    parsedState.version !== SAVE_VERSION ||
    !('state' in parsedState) ||
    typeof parsedState.checksum !== 'string'
  ) {
    return { state: null, integrityNotice: INVALID_FORMAT_NOTICE }
  }

  if (parsedState.checksum !== createChecksum(parsedState.state)) {
    return { state: null, integrityNotice: CHECKSUM_NOTICE }
  }

  if (!isValidSavedGameIntegrity(parsedState.state)) {
    return { state: null, integrityNotice: INCONSISTENT_SAVE_NOTICE }
  }

  return {
    state: sanitizeSavedGame(parsedState.state),
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
    JSON.stringify(createEnvelope(state)),
  )
}
