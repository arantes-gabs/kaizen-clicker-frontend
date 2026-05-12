import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'

const TICK_INTERVAL_MS = 250

export function useGameLoop(): void {
  const tick = useGameStore((state) => state.tick)
  const frameRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number | null>(null)
  const elapsedRef = useRef(0)

  useEffect(() => {
    function loop(timestamp: number): void {
      if (previousTimeRef.current === null) {
        previousTimeRef.current = timestamp
      }

      const delta = timestamp - previousTimeRef.current
      previousTimeRef.current = timestamp
      elapsedRef.current += delta

      if (elapsedRef.current >= TICK_INTERVAL_MS) {
        tick(elapsedRef.current / 1000)
        elapsedRef.current = 0
      }

      frameRef.current = window.requestAnimationFrame(loop)
    }

    frameRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [tick])
}
