/**
 * TMDB API client for TV series discovery.
 * API key from env: VITE_TMDB_API_KEY (create at https://www.themoviedb.org/settings/api)
 * Caches fetched pages and genre list in memory to avoid refetching.
 */

const BASE = 'https://api.themoviedb.org/3'
const PAGE_SIZE = 20

const pageCache = new Map()
let genreCache = null

function getApiKey() {
  const key = import.meta.env.VITE_TMDB_API_KEY
  if (!key || typeof key !== 'string') return null
  return key.trim()
}

async function request(path, params = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('TMDB API key not configured. Set VITE_TMDB_API_KEY in .env')
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`TMDB error ${res.status}: ${text.slice(0, 100)}`)
  }
  return res.json()
}

/** Fetch genre id -> name map once and cache. */
export async function fetchGenres() {
  if (genreCache) return genreCache
  const data = await request('/genre/tv/list')
  genreCache = Object.fromEntries((data.genres || []).map((g) => [g.id, g.name]))
  return genreCache
}

/** Popular TV (paginated, 1-based page). Cached per page. */
export async function fetchTVPopular(page = 1) {
  const key = `popular-${page}`
  if (pageCache.has(key)) return pageCache.get(key)
  const data = await request('/tv/popular', { page })
  const out = { results: data.results || [], total_pages: data.total_pages ?? 0 }
  pageCache.set(key, out)
  return out
}

/** Trending TV (paginated). Cached per page. */
export async function fetchTVTrending(page = 1) {
  const key = `trending-${page}`
  if (pageCache.has(key)) return pageCache.get(key)
  const data = await request('/trending/tv/week', { page })
  const out = { results: data.results || [], total_pages: data.total_pages ?? 0 }
  pageCache.set(key, out)
  return out
}

/** Rotate popular + trending so feed stays varied; same page index for both. */
export async function fetchTVDiscoveryPage(page = 1) {
  const [popular, trending] = await Promise.all([
    fetchTVPopular(page),
    fetchTVTrending(page),
  ])
  const seen = new Set()
  const merged = []
  const a = popular.results || []
  const b = trending.results || []
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] && !seen.has(a[i].id)) {
      seen.add(a[i].id)
      merged.push(a[i])
    }
    if (b[i] && !seen.has(b[i].id)) {
      seen.add(b[i].id)
      merged.push(b[i])
    }
  }
  const totalPages = Math.max(popular.total_pages || 0, trending.total_pages || 0)
  return { results: merged, total_pages: totalPages }
}

const ACCENT_PALETTE = [
  '#e63946', '#22c55e', '#4a90d9', '#c9a227', '#9c27b0', '#00d4aa', '#ffb74d', '#8b9dc3',
]

function pickAccent(id) {
  const n = Number(String(id).replace(/\D/g, '')) || 0
  return ACCENT_PALETTE[n % ACCENT_PALETTE.length]
}

function makeGradient(accent) {
  const r = 0.08
  const g = 0.08
  const b = 0.1
  return `linear-gradient(135deg, rgba(${r * 255},${g * 255},${b * 255},1) 0%, rgba(${r * 255 + 0.08},${g * 255 + 0.06},${b * 255 + 0.08},1) 50%, rgba(${r * 255},${g * 255},${b * 255},1) 100%)`
}

/**
 * Map a TMDB TV result to our app's show shape.
 * trailerId left null; can be filled later via /tv/{id}/videos if needed.
 */
export function mapTMDBToShow(item, genreMap = {}) {
  if (!item || !item.id) return null
  const year = item.first_air_date ? item.first_air_date.slice(0, 4) : ''
  const genreNames = (item.genre_ids || [])
    .map((id) => genreMap[id])
    .filter(Boolean)
  const genre = genreNames.length ? genreNames.join(' · ') : 'TV'
  const accent = pickAccent(item.id)
  return {
    id: String(item.id),
    title: item.name || 'Untitled',
    year,
    genre,
    description: item.overview || 'No description available.',
    rating: item.vote_average != null ? item.vote_average.toFixed(1) : '—',
    gradient: makeGradient(accent),
    accent,
    trailerId: null,
  }
}

export function isTmdbConfigured() {
  return !!getApiKey()
}
