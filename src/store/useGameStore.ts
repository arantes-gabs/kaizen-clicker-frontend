import { create } from 'zustand'
import { loadGame } from '../game/persistence/storage'
import { createInitialGameState } from '../game/state/gameState'
import { createGameActions } from './gameActions'
import { registerGameStorePersistence } from './gameStorePersistence'
import type { GameStore } from './gameStoreTypes'

export const useGameStore = create<GameStore>((set) => ({
  ...createInitialGameState(loadGame()),
  ...createGameActions(set),
}))

registerGameStorePersistence(useGameStore)
