/**
 * TVmaze API client for TV series discovery.
 * No API key required: https://api.tvmaze.com
 * Caches fetched pages in memory to avoid duplicate requests.
 */

const TVMAZE_BASE = 'https://api.tvmaze.com'
const BATCH_SIZE = 25

const pageCache = new Map()

function stripHtml(html) {
  if (!html || typeof html !== 'string') return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

const ACCENT_PALETTE = [
  '#e63946', '#22c55e', '#4a90d9', '#c9a227', '#9c27b0', '#00d4aa', '#ffb74d', '#8b9dc3',
]

function pickAccent(id) {
  const n = Number(String(id).replace(/\D/g, '')) || 0
  return ACCENT_PALETTE[n % ACCENT_PALETTE.length]
}

function makeGradient() {
  return 'linear-gradient(135deg, rgba(20,20,26,1) 0%, rgba(28,30,38,1) 50%, rgba(20,20,26,1) 100%)'
}

/**
 * Map a TVmaze show to our app's show shape.
 */
export function mapTvmazeToShow(item) {
  if (!item || item.id == null) return null
  const year = item.premiered ? item.premiered.slice(0, 4) : ''
  const genre = (item.genres && item.genres.length)
    ? item.genres.join(' · ')
    : (item.type || 'TV')
  const accent = pickAccent(item.id)
  const rating = item.rating?.average != null
    ? item.rating.average.toFixed(1)
    : '—'
  return {
    id: String(item.id),
    title: item.name || 'Untitled',
    year,
    genre,
    description: stripHtml(item.summary) || 'No description available.',
    rating,
    gradient: makeGradient(accent),
    accent,
    trailerId: null,
    posterUrl: item.image?.medium || item.image?.original || null,
  }
}

/**
 * Fetch one page of shows from TVmaze (up to 250 per page).
 * Cached in memory so the same page is not refetched.
 */
export async function fetchTvmazePage(page = 0) {
  if (pageCache.has(page)) return pageCache.get(page)
  const res = await fetch(`${TVMAZE_BASE}/shows?page=${page}`)
  if (!res.ok) throw new Error(`TVmaze error ${res.status}: ${res.statusText}`)
  const data = await res.json()
  const list = Array.isArray(data) ? data : []
  pageCache.set(page, list)
  return list
}

/**
 * Fetch a batch of shows for discovery: get one TVmaze page, map and filter
 * by excludeIds, return up to BATCH_SIZE shows. Prevents duplicates across sessions.
 */
export async function fetchShows({ excludeIds = [], page = 0 } = {}) {
  const raw = await fetchTvmazePage(page)
  const excludeSet = new Set(excludeIds.map(String))
  const mapped = raw
    .map(mapTvmazeToShow)
    .filter(Boolean)
    .filter((s) => !excludeSet.has(s.id))
  const shows = mapped.slice(0, BATCH_SIZE)
  const hasMore = mapped.length > BATCH_SIZE || raw.length >= 250
  return { shows, hasMore }
}
