import { memo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const rollerCount = 9
const PIECE_TRAVEL_MS = 4200

interface ConveyorBeltProps {
  defectRate: number
  productionPulse: number
  purchasePulse: number
}

interface ConveyorPiece {
  id: number
  type: 'good' | 'defect'
  label: string
  laneOffset: number
}

export const ConveyorBelt = memo(function ConveyorBelt({
  defectRate,
  productionPulse,
  purchasePulse,
}: ConveyorBeltProps) {
  const [pieces, setPieces] = useState<ConveyorPiece[]>([])
  const previousPulseRef = useRef(productionPulse)
  const sequenceRef = useRef(0)
  const defectAccumulatorRef = useRef(0)

  useEffect(() => {
    const producedPieces = Math.max(0, productionPulse - previousPulseRef.current)
    previousPulseRef.current = productionPulse

    if (producedPieces <= 0) {
      return
    }

    Array.from({ length: Math.min(4, producedPieces) }, (_, index) => {
      defectAccumulatorRef.current += defectRate
      const isDefect = defectAccumulatorRef.current >= 1

      if (isDefect) {
        defectAccumulatorRef.current -= 1
      }

      sequenceRef.current += 1

      const piece: ConveyorPiece = {
        id: Date.now() + index + Math.random(),
        type: isDefect ? 'defect' : 'good',
        label: isDefect ? 'DEFEITO' : 'BOM +1',
        laneOffset: (sequenceRef.current % 3) * 2 - 2,
      }

      setPieces((currentPieces) => [...currentPieces, piece])

      window.setTimeout(() => {
        setPieces((currentPieces) =>
          currentPieces.filter((item) => item.id !== piece.id),
        )
      }, PIECE_TRAVEL_MS)

      return piece
    })
  }, [defectRate, productionPulse])

  return (
    <div className="relative h-40 shrink-0 overflow-hidden rounded-[1.75rem] border-2 border-white bg-[#ECEFF3] shadow-inner sm:h-44">
      <div className="industrial-grid absolute inset-0 opacity-60" />

      <AnimatePresence mode="popLayout">
        {purchasePulse > 0 ? (
          <motion.div
            className="pointer-events-none absolute inset-2 z-20 rounded-[1.5rem] border-4 border-amber-300"
            key={purchasePulse}
            initial={{ opacity: 0, scale: 0.84 }}
            animate={{ opacity: [0, 1, 0], scale: [0.84, 1.04, 1.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75 }}
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        className="absolute left-4 top-4 h-20 w-24 rounded-[1.6rem] border-2 border-slate-200 bg-gradient-to-b from-white to-slate-100 shadow-[0_7px_0_rgba(148,163,184,0.18)] sm:left-6"
        animate={{ y: [0, -4, 0], rotate: [0, -1, 0, 1, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="mx-auto mt-4 h-8 w-16 rounded-full bg-emerald-300"
          animate={{ scaleX: [0.7, 1.08, 0.7], opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="mx-auto mt-2 h-2.5 w-16 rounded-full bg-slate-200" />
        <div className="mx-auto mt-1.5 grid w-16 grid-cols-3 gap-1">
          <span className="h-2 rounded-full bg-emerald-200" />
          <span className="h-2 rounded-full bg-amber-200" />
          <span className="h-2 rounded-full bg-slate-300" />
        </div>
      </motion.div>

      <motion.div
        className="absolute right-4 top-5 h-22 w-24 rounded-[1.6rem] border-2 border-amber-200 bg-gradient-to-b from-amber-100 to-amber-200 shadow-[0_7px_0_rgba(217,119,6,0.18)] sm:right-6"
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="mx-auto mt-4 h-10 w-10 rounded-2xl border-[5px] border-amber-300 bg-white"
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <div className="mx-auto mt-2 h-2.5 w-16 rounded-full bg-amber-300" />
      </motion.div>

      <div className="conveyor-belt absolute inset-x-3 bottom-7 h-16 rounded-[1.35rem] border-2 border-slate-300 sm:inset-x-5">
        <AnimatePresence>
          {pieces.map((piece) => (
            <motion.div
              className={[
                'absolute z-10 h-10 w-12 rounded-xl border-2 shadow-[0_6px_0_rgba(15,23,42,0.16)]',
                piece.type === 'defect'
                  ? 'border-red-300 bg-red-200'
                  : 'border-emerald-300 bg-emerald-200',
              ].join(' ')}
              key={piece.id}
              initial={{ opacity: 0, x: -72, y: 12 + piece.laneOffset, scale: 0.88 }}
              animate={{
                opacity: 1,
                x: ['-72px', '820px'],
                y: 12 + piece.laneOffset,
                rotate: piece.type === 'defect' ? [-5, 4, -3] : [-2, 1, -1],
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                x: {
                  duration: PIECE_TRAVEL_MS / 1000,
                  ease: 'linear',
                },
                opacity: { duration: 0.2 },
                rotate: {
                  duration: piece.type === 'defect' ? 0.55 : 1.4,
                  repeat: Math.ceil(PIECE_TRAVEL_MS / 1000),
                  ease: 'easeInOut',
                },
              }}
            >
              <span
                className={[
                  'mx-auto mt-3 block h-2 w-7 rounded-full',
                  piece.type === 'defect' ? 'bg-red-300' : 'bg-emerald-300',
                ].join(' ')}
              />
              {piece.type === 'defect' ? (
                <span className="mx-auto mt-1 block h-1.5 w-5 rounded-full bg-red-400" />
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-6 bottom-2 flex justify-between">
        {Array.from({ length: rollerCount }, (_, index) => (
          <motion.span
            className="h-4 w-4 rounded-full border-2 border-slate-300 bg-white shadow-inner"
            key={index}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-10 bottom-24 z-30 flex justify-end">
        <AnimatePresence mode="popLayout">
          {pieces.slice(-3).map((piece) => (
            <motion.span
              className={[
                'ml-2 rounded-full border-2 border-white px-3 py-1 font-display text-sm font-black shadow-[0_4px_0_rgba(15,23,42,0.16)]',
                piece.type === 'good'
                  ? 'bg-emerald-300 text-emerald-950'
                  : 'bg-red-300 text-red-950',
              ].join(' ')}
              key={`label-${piece.id}`}
              initial={{ opacity: 0, scale: 0.75, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -18 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {piece.label}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
})
