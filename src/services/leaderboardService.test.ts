import { afterEach, describe, expect, it, vi } from 'vitest'
import { getLeaderboard } from './leaderboardService'

describe('leaderboard service', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('disables browser caching on polling requests', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify({ scores: [] }), { status: 200 })
    })

    vi.stubGlobal('fetch', fetchMock)

    await getLeaderboard()

    const requestInit = fetchMock.mock.calls[0]?.[1]

    expect(requestInit).toBeDefined()

    if (!requestInit) {
      throw new Error('Expected leaderboard request options')
    }

    const headers = requestInit.headers as Headers

    expect(requestInit.cache).toBe('no-store')
    expect(headers.get('Cache-Control')).toBe('no-cache')
    expect(headers.get('Pragma')).toBe('no-cache')
  })
})
