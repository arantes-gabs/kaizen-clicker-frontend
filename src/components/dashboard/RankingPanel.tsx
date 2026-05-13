import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useRankingController } from '../../hooks/useRankingController'
import { formatNumber } from '../../utils/format'
import { Panel } from '../ui/Panel'

export function RankingPanel() {
  const {
    entries,
    feedback,
    isSaving,
    playerName,
    setPlayerName,
    submitScore,
  } = useRankingController()

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
              Nenhuma pontuacao ainda
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
            Salvar pontuacao
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
            {isSaving ? 'Enviando...' : 'Salvar pontuacao'}
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
