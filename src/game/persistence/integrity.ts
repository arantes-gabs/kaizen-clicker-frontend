import type { PersistedGameState } from '../../types/game'

const SAVE_VERSION = 2
const CHECKSUM_PREFIX = 'kaizen-clicker-save-v2'

export type SaveIntegrityIssue =
  | 'checksum'
  | 'corrupted'
  | 'invalid-format'

interface StoredGameEnvelope {
  version: typeof SAVE_VERSION
  state: PersistedGameState
  checksum: string
}

type ParseResult =
  | { issue: null; state: PersistedGameState }
  | { issue: SaveIntegrityIssue; state: null }

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

function hasBasicSaveShape(value: unknown): value is PersistedGameState {
  if (!isRecord(value)) {
    return false
  }

  return (
    Number.isFinite(value.points) &&
    Number.isFinite(value.savedAt) &&
    typeof value.isPaused === 'boolean' &&
    isRecord(value.upgrades) &&
    isRecord(value.metrics) &&
    Array.isArray(value.history)
  )
}

function hasEnvelopeShape(value: unknown): value is StoredGameEnvelope {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.version === SAVE_VERSION &&
    typeof value.checksum === 'string' &&
    hasBasicSaveShape(value.state)
  )
}

export function createSaveEnvelope(
  state: PersistedGameState,
): StoredGameEnvelope {
  return {
    version: SAVE_VERSION,
    state,
    checksum: createChecksum(state),
  }
}

export function parseSaveEnvelope(savedState: string): ParseResult {
  let parsedState: unknown

  try {
    parsedState = JSON.parse(savedState) as unknown
  } catch {
    return { issue: 'corrupted', state: null }
  }

  if (!hasEnvelopeShape(parsedState)) {
    return { issue: 'invalid-format', state: null }
  }

  if (parsedState.checksum !== createChecksum(parsedState.state)) {
    return { issue: 'checksum', state: null }
  }

  return { issue: null, state: parsedState.state }
}
