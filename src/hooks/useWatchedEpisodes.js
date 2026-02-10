import { useState, useEffect } from 'react'
import { loadWatchedEpisodes, saveWatchedEpisodes } from '../lib/storage'

/**
 * Watched episodes state: { [seriesId]: { [episodeId]: true } }.
 * Loads from localStorage on init, saves on every change.
 */
export function useWatchedEpisodes() {
  const [watched, setWatched] = useState(loadWatchedEpisodes)

  useEffect(() => {
    saveWatchedEpisodes(watched)
  }, [watched])

  const toggleWatched = (seriesId, episodeId) => {
    setWatched((prev) => {
      const next = { ...prev }
      if (!next[seriesId]) next[seriesId] = {}
      next[seriesId] = { ...next[seriesId], [episodeId]: !next[seriesId][episodeId] }
      return next
    })
  }

  return { watched, toggleWatched }
}
