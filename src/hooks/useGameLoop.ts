import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'

const TICK_INTERVAL_MS = 500

export function useGameLoop(): void {
  const tick = useGameStore((state) => state.tick)
  const previousTimeRef = useRef<number | null>(null)

  useEffect(() => {
    function runTick(): void {
      const timestamp = performance.now()

      if (previousTimeRef.current === null) {
        previousTimeRef.current = timestamp
        return
      }

      const delta = timestamp - previousTimeRef.current
      previousTimeRef.current = timestamp
      tick(delta / 1000)
    }

    const intervalId = window.setInterval(runTick, TICK_INTERVAL_MS)
    runTick()

    return () => {
      window.clearInterval(intervalId)
    }
  }, [tick])
}
