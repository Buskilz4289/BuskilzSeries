/**
 * Central discovery hook: feed state, async loading, undo, persistence.
 * Uses TMDB via discoveryService; caches pages in service layer (no refetch).
 * Tracks seen/liked/skipped across sessions; disables actions while loading.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchShows } from '../services/discoveryService'
import { loadMatches, saveMatches, loadDisliked, saveDisliked } from '../lib/storage'

const LOAD_MORE_THRESHOLD = 2

export function useDiscoveryFeed() {
  const [stack, setStack] = useState([])
  const [matches, setMatches] = useState(loadMatches)
  const [disliked, setDisliked] = useState(loadDisliked)
  const [lastSwiped, setLastSwiped] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const nextPageRef = useRef(0)
  const excludeIdsRef = useRef([
    ...loadMatches().map((s) => s.id),
    ...loadDisliked().map((s) => s.id),
  ])

  const persistAndSync = useCallback(() => {
    const likedIds = matches.map((s) => s.id)
    const skippedIds = disliked.map((s) => s.id)
    saveMatches(matches)
    saveDisliked(disliked)
    excludeIdsRef.current = [...likedIds, ...skippedIds]
  }, [matches, disliked])

  useEffect(() => persistAndSync(), [persistAndSync])

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
    if (direction === 'right') {
      setMatches((m) => [show, ...m])
    } else {
      setDisliked((d) => [show, ...d])
    }
    setLastSwiped({ show, direction })
  }, [])

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
    setDisliked([])
    excludeIdsRef.current = matches.map((s) => s.id)
    saveDisliked([])
    nextPageRef.current = 0
    setHasMore(true)
    setError(null)
    setIsLoading(true)
    fetchShows({
      excludeIds: excludeIdsRef.current,
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
  }, [matches])

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
