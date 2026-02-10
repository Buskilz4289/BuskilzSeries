// Liked/skipped/seen shows and watched episodes. Persisted across sessions.
export const STORAGE_KEY_MATCHES = 'series-swipe-matches'
export const STORAGE_KEY_DISLIKED = 'series-swipe-disliked'
export const STORAGE_KEY_SEEN = 'series-swipe-seen'
const STORAGE_KEY_WATCHED = 'series-swipe-watched'

function isShowObject(x) {
  return x && typeof x === 'object' && typeof x.id !== 'undefined'
}

/** Load liked shows (full objects). Old format (array of ids) returns []. */
export function loadMatches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCHES)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    if (data.length && !isShowObject(data[0])) return []
    return data.filter(isShowObject)
  } catch {
    return []
  }
}

export function saveMatches(shows) {
  try {
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(shows || []))
  } catch {
    // ignore
  }
}

/** Load skipped shows (full objects). Old format returns []. */
export function loadDisliked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISLIKED)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    if (data.length && !isShowObject(data[0])) return []
    return data.filter(isShowObject)
  } catch {
    return []
  }
}

export function saveDisliked(shows) {
  try {
    localStorage.setItem(STORAGE_KEY_DISLIKED, JSON.stringify(shows || []))
  } catch {
    // ignore
  }
}

/** Load seen show IDs (any swiped show). Safe on empty/corrupt. */
export function loadSeenIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEEN)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter((id) => typeof id === 'string' || typeof id === 'number').map(String)
  } catch {
    return []
  }
}

/** Persist seen show IDs. */
export function saveSeenIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(ids || []))
  } catch {
    // ignore
  }
}

/** @deprecated Use loadMatches / loadDisliked for full objects. */
export function loadMatchIds() {
  return loadMatches().map((s) => s.id)
}

/** @deprecated Use saveMatches with full objects. */
export function saveMatchIds(ids) {
  if (Array.isArray(ids)) saveMatches(ids.map((id) => ({ id: String(id), title: String(id), year: '', genre: '', description: '', rating: '', gradient: '', accent: '' })))
}

/** @deprecated Use loadDisliked. */
export function loadDislikeIds() {
  return loadDisliked().map((s) => s.id)
}

/** @deprecated Use saveDisliked. */
export function saveDislikeIds(ids) {
  if (Array.isArray(ids)) saveDisliked(ids.map((id) => ({ id: String(id), title: String(id), year: '', genre: '', description: '', rating: '', gradient: '', accent: '' })))
}

/** Watched episodes: { [seriesId]: { [episodeId]: true } } */
export function loadWatchedEpisodes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WATCHED)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return typeof data === 'object' && data !== null ? data : {}
  } catch {
    return {}
  }
}

export function saveWatchedEpisodes(watched) {
  try {
    localStorage.setItem(STORAGE_KEY_WATCHED, JSON.stringify(watched))
  } catch {
    // ignore
  }
}
