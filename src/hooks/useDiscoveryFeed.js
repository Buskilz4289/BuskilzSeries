/**
 * Central discovery hook: feed state, async loading, undo, persistence.
 * Uses discoveryService (TMDB if key set, else TVmaze).
 * Persists liked, skipped, and seen in localStorage via useLocalStorage; no UI flicker on load.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchShows } from '../services/discoveryService'
import {
  loadMatches,
  loadDisliked,
  loadSeenIds,
  STORAGE_KEY_MATCHES,
  STORAGE_KEY_DISLIKED,
  STORAGE_KEY_SEEN,
} from '../lib/storage'
import { useLocalStorage } from './useLocalStorage'

const LOAD_MORE_THRESHOLD = 2

function isShowObject(x) {
  return x && typeof x === 'object' && x.id != null
}

function validateMatchesShows(parsed) {
  if (!Array.isArray(parsed)) return undefined
  const filtered = parsed.filter(isShowObject)
  return filtered.length === parsed.length ? filtered : undefined
}

function validateSeenIds(parsed) {
  if (!Array.isArray(parsed)) return undefined
  return parsed.filter((id) => typeof id === 'string' || typeof id === 'number').map(String)
}

function getInitialSeenIds() {
  const seen = loadSeenIds()
  const liked = loadMatches().map((s) => s.id)
  const skipped = loadDisliked().map((s) => s.id)
  return [...new Set([...seen, ...liked, ...skipped])]
}

export function useDiscoveryFeed() {
  const [matches, setMatches] = useLocalStorage(
    STORAGE_KEY_MATCHES,
    loadMatches,
    (p) => validateMatchesShows(p) ?? loadMatches()
  )
  const [disliked, setDisliked] = useLocalStorage(
    STORAGE_KEY_DISLIKED,
    loadDisliked,
    (p) => validateMatchesShows(p) ?? loadDisliked()
  )
  const [seenIds, setSeenIds] = useLocalStorage(STORAGE_KEY_SEEN, getInitialSeenIds, (p) =>
    Array.isArray(p) ? validateSeenIds(p) : undefined
  )

  const [stack, setStack] = useState([])
  const [lastSwiped, setLastSwiped] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const nextPageRef = useRef(0)
  const excludeIdsRef = useRef(getInitialSeenIds())

  useEffect(() => {
    excludeIdsRef.current = seenIds
  }, [seenIds])

  const loadMore = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { shows, hasMore: more } = await fetchShows({
        excludeIds: excludeIdsRef.current,
        page: nextPageRef.current,
      })
      setStack((prev) => (nextPageRef.current === 0 ? shows : [...prev, ...shows]))
      setHasMore(more)
      nextPageRef.current += 1
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shows')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoading || !hasMore || stack.length > LOAD_MORE_THRESHOLD) return
    if (error) return
    loadMore()
  }, [stack.length, isLoading, hasMore, error, loadMore])

  const onSwipe = useCallback((show, direction) => {
    if (!show || !show.id) return
    setIsTransitioning(true)
    setSeenIds((prev) => (prev.includes(String(show.id)) ? prev : [...prev, String(show.id)]))
    if (direction === 'right') {
      setMatches((m) => [show, ...m])
    } else {
      setDisliked((d) => [show, ...d])
    }
    setLastSwiped({ show, direction })
  }, [setSeenIds])

  const onCardExit = useCallback((id) => {
    setStack((prev) => prev.filter((s) => s.id !== id))
    setIsTransitioning(false)
  }, [])

  const undo = useCallback(() => {
    if (!lastSwiped) return
    const { show, direction } = lastSwiped
    if (direction === 'right') {
      setMatches((m) => m.filter((s) => s.id !== show.id))
    } else {
      setDisliked((d) => d.filter((s) => s.id !== show.id))
    }
    setStack((prev) => (prev.some((s) => s.id === show.id) ? prev : [show, ...prev]))
    setLastSwiped(null)
  }, [lastSwiped])

  const restoreToDiscover = useCallback((show) => {
    setDisliked((d) => d.filter((s) => s.id !== show.id))
    setStack((prev) => (prev.some((s) => s.id === show.id) ? prev : [show, ...prev]))
  }, [])

  const removeFromMatches = useCallback((id) => {
    setMatches((m) => m.filter((s) => s.id !== id))
  }, [])

  const seeSkippedAgain = useCallback(() => {
    const likedIds = matches.map((s) => String(s.id))
    setDisliked([])
    setSeenIds((prev) => prev.filter((id) => !disliked.some((d) => String(d.id) === id)))
    excludeIdsRef.current = likedIds
    nextPageRef.current = 0
    setHasMore(true)
    setError(null)
    setIsLoading(true)
    fetchShows({
      excludeIds: likedIds,
      page: 0,
    })
      .then(({ shows, hasMore: more }) => {
        setStack(shows)
        setHasMore(more)
        nextPageRef.current = 1
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load shows')
      })
      .finally(() => setIsLoading(false))
  }, [matches, disliked, setDisliked, setSeenIds])

  const retry = useCallback(() => {
    setError(null)
    loadMore()
  }, [loadMore])

  const isBusy = isTransitioning || isLoading
  const hasCards = stack.length > 0

  return {
    stack,
    matches,
    disliked,
    lastSwiped,
    isLoading,
    isTransitioning,
    isBusy,
    hasMore,
    hasCards,
    error,
    onSwipe,
    onCardExit,
    undo,
    restoreToDiscover,
    removeFromMatches,
    seeSkippedAgain,
    loadMore,
    retry,
  }
}

/** Alias for discovery hook (useDiscoverShows). */
export { useDiscoveryFeed as useDiscoverShows }
