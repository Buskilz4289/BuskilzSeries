/**
 * Discovery service: fetches TV series for the swipe feed.
 * Priority: TMDB (if key set) → TVmaze (no key) → local catalog.
 * Excludes liked/skipped IDs so the same series never appears twice.
 */

import {
  fetchTVDiscoveryPage,
  fetchGenres,
  mapTMDBToShow,
  isTmdbConfigured,
} from './tmdb'
import { fetchShows as fetchShowsTvmaze } from './tvmazeService'
import { getSeriesCatalog } from '../data/series'

const LOCAL_PAGE_SIZE = 8

/** Fallback when no network API: local catalog, paginated and filtered. */
async function fetchShowsLocal({ excludeIds = [], page = 0 } = {}) {
  const catalog = getSeriesCatalog()
  const excludeSet = new Set(excludeIds.map(String))
  const unseen = catalog.filter((s) => !excludeSet.has(String(s.id)))
  const start = page * LOCAL_PAGE_SIZE
  const shows = unseen.slice(start, start + LOCAL_PAGE_SIZE)
  const hasMore = start + shows.length < unseen.length
  await new Promise((r) => setTimeout(r, 400))
  return { shows, hasMore }
}

/** Single entry point: TMDB → TVmaze → local, filters by excludeIds. */
export async function fetchShows({ excludeIds = [], page = 0 } = {}) {
  if (isTmdbConfigured()) {
    const pageNum = page + 1
    const [genreMap, { results, total_pages }] = await Promise.all([
      fetchGenres(),
      fetchTVDiscoveryPage(pageNum),
    ])
    const excludeSet = new Set(excludeIds.map(String))
    const mapped = (results || [])
      .map((item) => mapTMDBToShow(item, genreMap))
      .filter(Boolean)
      .filter((s) => !excludeSet.has(s.id))
    return { shows: mapped, hasMore: pageNum < (total_pages || 0) }
  }
  return fetchShowsTvmaze({ excludeIds, page })
}

export { isTmdbConfigured }
