import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { motion } from 'framer-motion'
import {
  LeaderboardApiError,
  getLeaderboard,
  saveLeaderboardEntry,
  type LeaderboardEntry,
} from '../../services/leaderboardService'
import { useGameStore } from '../../store/useGameStore'
import { formatNumber } from '../../utils/format'
import { Panel } from '../ui/Panel'

const POLLING_INTERVAL_MS = 5_000
const SCORE_AUTOSAVE_INTERVAL_MS = 60_000
const PLAYER_NAME_KEY = 'kaizen-clicker:player-name'

type Feedback = { tone: 'success' | 'error'; message: string } | null
type SaveMode = 'manual' | 'auto'

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

  return 'Não foi possível salvar.'
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

export function RankingPanel() {
  const [playerName, setPlayerName] = useState(getSavedPlayerName)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
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

      console.log(activePlayerName)

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
                  ? `Pontuação salva. Ranking #${result.rank}.`
                  : `Melhor pontuação mantida: ${formatNumber(result.bestScore)}.`,
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

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    void submitScore('manual')
  }

  return (
    <Panel
      className="shrink-0 p-3 sm:p-4"
      eyebrow="Top 10"
      title="Ranking"
    >
      <div className="grid gap-2">
        <ol className="grid max-h-36 gap-1 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <li className="rounded-2xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase text-slate-400">
              Nenhuma pontuação ainda
            </li>
          ) : (
            entries.map((entry, index) => (
              <li
                className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border-2 border-white bg-white/80 px-3 py-1.5 text-sm shadow-sm"
                key={entry.id}
              >
                <span className="font-display text-base font-black text-amber-700">
                  #{entry.rank ?? index + 1}
                </span>
                <span className="truncate font-black text-slate-700">
                  {entry.playerName}
                </span>
                <span className="font-display font-black text-emerald-700">
                  {formatNumber(entry.points)}
                </span>
              </li>
            ))
          )}
        </ol>

        <form className="grid gap-2" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-[0.65rem] font-black uppercase text-slate-400">
            Salvar pontuação
            <input
              className="min-h-10 rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-300"
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Nome do jogador"
              value={playerName}
            />
          </label>
          <motion.button
            className="min-h-10 rounded-2xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-200 to-emerald-300 font-display text-base font-black text-emerald-950 shadow-[0_5px_0_#0f9f6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:grayscale"
            disabled={isSaving}
            type="submit"
            whileHover={isSaving ? undefined : { y: -2, scale: 1.02 }}
            whileTap={isSaving ? undefined : { y: 3, scale: 0.98 }}
          >
            {isSaving ? 'Enviando...' : 'Salvar pontuação'}
          </motion.button>
        </form>

        {feedback ? (
          <p
            className={[
              'rounded-2xl px-3 py-2 text-xs font-black uppercase',
              feedback.tone === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600',
            ].join(' ')}
            role="status"
          >
            {feedback.message}
          </p>
        ) : null}

        <p className="text-center text-[0.62rem] font-black uppercase text-slate-400">
          Ranking a cada 5s. Autosave a cada 60s.
        </p>
      </div>
    </Panel>
  )
}
