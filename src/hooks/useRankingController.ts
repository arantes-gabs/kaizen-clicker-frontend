import { useCallback, useEffect, useRef, useState } from 'react'
import {
  LeaderboardApiError,
  getLeaderboard,
  saveLeaderboardEntry,
  type LeaderboardEntry,
} from '../services/leaderboardService'
import { useGameStore } from '../store/useGameStore'
import { formatNumber } from '../utils/format'

const POLLING_INTERVAL_MS = 5_000
const SCORE_AUTOSAVE_INTERVAL_MS = 60_000
const PLAYER_NAME_KEY = 'kaizen-clicker:player-name'

type SaveMode = 'manual' | 'auto'

export type RankingFeedback =
  | { tone: 'success' | 'error'; message: string }
  | null

function getFeedbackMessage(error: unknown): string {
  if (error instanceof LeaderboardApiError) {
    if (error.status === 429 && error.retryAfterSeconds) {
      return `Aguarde ${error.retryAfterSeconds}s para salvar novamente.`
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Nao foi possivel salvar.'
}

function getSavedPlayerName(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(PLAYER_NAME_KEY) ?? ''
}

function savePlayerName(playerName: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PLAYER_NAME_KEY, playerName)
}

export function useRankingController(): {
  entries: LeaderboardEntry[]
  feedback: RankingFeedback
  isSaving: boolean
  playerName: string
  setPlayerName: (playerName: string) => void
  submitScore: (mode: SaveMode) => Promise<void>
} {
  const [playerName, setPlayerName] = useState(getSavedPlayerName)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [feedback, setFeedback] = useState<RankingFeedback>(null)
  const [isSaving, setIsSaving] = useState(false)
  const isSavingRef = useRef(false)
  const isMountedRef = useRef(true)
  const playerNameRef = useRef(playerName)

  const refreshRanking = useCallback(async (showError = true): Promise<void> => {
    try {
      const nextEntries = await getLeaderboard(10)

      if (isMountedRef.current) {
        setEntries(nextEntries)
      }
    } catch (error) {
      if (showError && isMountedRef.current) {
        setFeedback((currentFeedback) =>
          currentFeedback ?? {
            tone: 'error',
            message: getFeedbackMessage(error),
          },
        )
      }
    }
  }, [])

  const submitScore = useCallback(
    async (mode: SaveMode): Promise<void> => {
      const activePlayerName = playerNameRef.current.trim()

      if (activePlayerName.length < 2) {
        if (mode === 'manual') {
          setFeedback({
            tone: 'error',
            message: 'Informe um nome com pelo menos 2 caracteres.',
          })
        }

        return
      }

      if (isSavingRef.current) {
        return
      }

      isSavingRef.current = true
      setIsSaving(true)

      if (mode === 'manual') {
        setFeedback(null)
      }

      try {
        const { points, metrics, upgrades } = useGameStore.getState()
        const result = await saveLeaderboardEntry({
          playerName: activePlayerName,
          score: points,
          elapsedSeconds: metrics.elapsedSeconds,
          upgrades,
        })

        await refreshRanking(false)

        if (isMountedRef.current) {
          setFeedback({
            tone: 'success',
            message:
              mode === 'auto'
                ? `Autosave realizado. Ranking #${result.rank}.`
                : result.saved
                  ? `Pontuacao salva. Ranking #${result.rank}.`
                  : `Melhor pontuacao mantida: ${formatNumber(result.bestScore)}.`,
          })
        }
      } catch (error) {
        if (
          isMountedRef.current &&
          (mode === 'manual' ||
            !(error instanceof LeaderboardApiError) ||
            error.status !== 429)
        ) {
          setFeedback({ tone: 'error', message: getFeedbackMessage(error) })
        }
      } finally {
        isSavingRef.current = false

        if (isMountedRef.current) {
          setIsSaving(false)
        }
      }
    },
    [refreshRanking],
  )

  useEffect(() => {
    playerNameRef.current = playerName
    savePlayerName(playerName)
  }, [playerName])

  useEffect(() => {
    isMountedRef.current = true
    void refreshRanking()

    const intervalId = window.setInterval(() => {
      void refreshRanking()
    }, POLLING_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      isMountedRef.current = false
    }
  }, [refreshRanking])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void submitScore('auto')
    }, SCORE_AUTOSAVE_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [submitScore])

  return {
    entries,
    feedback,
    isSaving,
    playerName,
    setPlayerName,
    submitScore,
  }
}
