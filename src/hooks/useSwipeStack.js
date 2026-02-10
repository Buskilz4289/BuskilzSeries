import { useState, useEffect } from 'react'
import { SERIES } from '../data/series'
import { loadMatchIds, saveMatchIds, loadDislikeIds, saveDislikeIds } from '../lib/storage'

/** Build discover stack: series not in matches or disliked. */
export function getDiscoverStack(matchIds, dislikeIds) {
  return SERIES.filter((s) => !matchIds.includes(s.id) && !dislikeIds.includes(s.id))
}

/**
 * Manages swipe stack, matches (liked), disliked, and undo.
 * Persists matches and disliked to localStorage on change; loads once on init.
 */
export function useSwipeStack() {
  const matchIds = loadMatchIds()
  const dislikeIds = loadDislikeIds()

  const [stack, setStack] = useState(() => getDiscoverStack(matchIds, dislikeIds))
  const [matches, setMatches] = useState(() =>
    matchIds.map((id) => SERIES.find((s) => s.id === id)).filter(Boolean)
  )
  const [disliked, setDisliked] = useState(() =>
    dislikeIds.map((id) => SERIES.find((s) => s.id === id)).filter(Boolean)
  )
  // One-step undo: last swiped show and direction (right = like, left = pass)
  const [lastSwiped, setLastSwiped] = useState(null)

  useEffect(() => {
    saveMatchIds(matches.map((s) => s.id))
  }, [matches])

  useEffect(() => {
    saveDislikeIds(disliked.map((s) => s.id))
  }, [disliked])

  const onSwipe = (id, direction) => {
    const show = SERIES.find((s) => s.id === id)
    if (!show) return
    if (direction === 'right') {
      setMatches((m) => [show, ...m])
    } else {
      setDisliked((d) => [show, ...d])
    }
    setLastSwiped({ show, direction })
  }

  const onCardExit = (id) => {
    setStack((prev) => prev.filter((s) => s.id !== id))
  }

  const undo = () => {
    if (!lastSwiped) return
    const { show, direction } = lastSwiped
    if (direction === 'right') {
      setMatches((m) => m.filter((s) => s.id !== show.id))
    } else {
      setDisliked((d) => d.filter((s) => s.id !== show.id))
    }
    setStack((prev) => (prev.some((s) => s.id === show.id) ? prev : [show, ...prev]))
    setLastSwiped(null)
  }

  const resetStack = () => {
    setStack(getDiscoverStack(matches.map((s) => s.id), disliked.map((s) => s.id)))
  }

  /** Move a passed show back to the discover stack. */
  const restoreToDiscover = (show) => {
    setDisliked((d) => d.filter((s) => s.id !== show.id))
    setStack((prev) => (prev.some((s) => s.id === show.id) ? prev : [show, ...prev]))
  }

  const removeFromMatches = (id) => {
    setMatches((m) => m.filter((s) => s.id !== id))
  }

  return {
    stack,
    matches,
    disliked,
    lastSwiped,
    onSwipe,
    onCardExit,
    undo,
    resetStack,
    restoreToDiscover,
    removeFromMatches,
    getDiscoverStack,
  }
}
