import type { UpgradeLevels } from '../types/game'

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

export interface LeaderboardEntry {
  id: string
  playerName: string
  points: number
  oee: number
  savedAt: number
  rank?: number
}

export interface ScoreSubmission {
  playerName: string
  score: number
  elapsedSeconds: number
  upgrades: UpgradeLevels
}

export interface SaveScoreResult {
  requestId: string
  playerName: string
  submittedScore: number
  bestScore: number
  saved: boolean
  rank: number
  theoreticalMaxScore: number
  acceptedMaxScore: number
  marginPercent: number
  updatedAt: string
}

interface ApiScorePayload {
  playerName: string
  score: number
  elapsedSeconds: number
  requestId: string
  improvements: Record<keyof UpgradeLevels, number>
}

export class LeaderboardApiError extends Error {
  readonly status: number
  readonly retryAfterSeconds?: number

  constructor(
    message: string,
    status: number,
    retryAfterSeconds?: number,
  ) {
    super(message)
    this.name = 'LeaderboardApiError'
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function getErrorMessage(body: unknown): string | null {
  if (!isRecord(body)) {
    return null
  }

  const message = body.message ?? body.error

  if (Array.isArray(message)) {
    return message.filter((item) => typeof item === 'string').join(' ')
  }

  return typeof message === 'string' ? message : null
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function createRequestHeaders(headers?: HeadersInit): Headers {
  const requestHeaders = new Headers(headers)

  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  requestHeaders.set('Cache-Control', 'no-cache')
  requestHeaders.set('Pragma', 'no-cache')

  return requestHeaders
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response
  const { cache, headers, ...requestInit } = init ?? {}

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      cache: cache ?? 'no-store',
      headers: createRequestHeaders(headers),
    })
  } catch {
    throw new LeaderboardApiError(
      'API local indisponivel. Verifique se o backend esta rodando na porta 3000.',
      0,
    )
  }

  const body = await readJson(response)

  if (!response.ok) {
    const retryAfter = Number(response.headers.get('Retry-After'))
    const fallbackMessage = getFallbackErrorMessage(response.status, retryAfter)

    throw new LeaderboardApiError(
      getErrorMessage(body) ?? fallbackMessage,
      response.status,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    )
  }

  return body
}

function getFallbackErrorMessage(
  status: number,
  retryAfterSeconds: number,
): string {
  if (status === 429) {
    const wait = Number.isFinite(retryAfterSeconds)
      ? ` Aguarde ${retryAfterSeconds}s.`
      : ''

    return `Limite de envio atingido.${wait}`
  }

  if (status === 422) {
    return 'Pontuacao recusada pela validacao do servidor.'
  }

  if (status === 404) {
    return 'Pontuacao nao encontrada.'
  }

  return 'Nao foi possivel comunicar com a API.'
}

function getTopEntriesPayload(body: unknown): unknown[] {
  if (Array.isArray(body)) {
    return body
  }

  if (!isRecord(body)) {
    return []
  }

  const possibleEntries = body.scores ?? body.entries ?? body.data

  return Array.isArray(possibleEntries) ? possibleEntries : []
}

function mapLeaderboardEntry(value: unknown, index: number): LeaderboardEntry {
  if (!isRecord(value)) {
    return {
      id: `score-${index + 1}`,
      playerName: 'Jogador',
      points: 0,
      oee: 0,
      savedAt: Date.now(),
      rank: index + 1,
    }
  }

  const updatedAt = getString(value.updatedAt ?? value.savedAt)
  const score = getNumber(
    value.score ?? value.bestScore ?? value.submittedScore ?? value.points,
  )

  return {
    id: getString(value.id, `${getString(value.playerName, 'score')}-${index}`),
    playerName: getString(value.playerName, 'Jogador'),
    points: score,
    oee: getNumber(value.oee),
    savedAt: updatedAt ? new Date(updatedAt).getTime() : Date.now(),
    rank: Math.floor(getNumber(value.rank, index + 1)),
  }
}

function mapSaveScoreResult(body: unknown): SaveScoreResult {
  if (!isRecord(body)) {
    throw new LeaderboardApiError('Resposta invalida da API.', 0)
  }

  return {
    requestId: getString(body.requestId),
    playerName: getString(body.playerName),
    submittedScore: getNumber(body.submittedScore),
    bestScore: getNumber(body.bestScore),
    saved: Boolean(body.saved),
    rank: Math.floor(getNumber(body.rank)),
    theoreticalMaxScore: getNumber(body.theoreticalMaxScore),
    acceptedMaxScore: getNumber(body.acceptedMaxScore),
    marginPercent: getNumber(body.marginPercent),
    updatedAt: getString(body.updatedAt),
  }
}

function getImprovements(upgrades: UpgradeLevels): Record<keyof UpgradeLevels, number> {
  return {
    fiveS: upgrades.fiveS.level,
    kanban: upgrades.kanban.level,
    pokaYoke: upgrades.pokaYoke.level,
    tpm: upgrades.tpm.level,
    andon: upgrades.andon.level,
    jidoka: upgrades.jidoka.level,
    heijunka: upgrades.heijunka.level,
    justInTime: upgrades.justInTime.level,
  }
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)))
  const body = await requestJson(`/scores/top?limit=${safeLimit}`)

  return getTopEntriesPayload(body)
    .map(mapLeaderboardEntry)
    .sort((a, b) => b.points - a.points)
    .slice(0, safeLimit)
}

export async function saveLeaderboardEntry(
  submission: ScoreSubmission,
): Promise<SaveScoreResult> {
  const trimmedName = submission.playerName.trim()

  if (trimmedName.length < 2) {
    throw new LeaderboardApiError('Use pelo menos 2 caracteres.', 400)
  }

  const payload: ApiScorePayload = {
    playerName: trimmedName.slice(0, 18),
    score: Math.max(0, Math.floor(submission.score)),
    elapsedSeconds: Math.max(1, Math.floor(submission.elapsedSeconds)),
    requestId: crypto.randomUUID(),
    improvements: getImprovements(submission.upgrades),
  }

  const body = await requestJson('/scores', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return mapSaveScoreResult(body)
}
