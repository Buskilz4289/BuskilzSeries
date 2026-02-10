/**
 * Search and filter hook for TV series.
 * TVmaze API used only for title search (/search/shows?q=). Year and genre
 * are applied client-side after fetch; genres derived from returned shows.
 */

import { useState, useCallback, useMemo } from 'react'
import { searchShows } from '../services/tvmazeService'

export function useSearchShows() {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [genre, setGenre] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const runSearch = useCallback(async (searchQuery) => {
    const q = typeof searchQuery === 'string' ? searchQuery.trim() : ''
    setError(null)
    if (!q) {
      setSearchResults([])
      setYear('')
      setGenre('')
      return
    }
    setYear('')
    setGenre('')
    setIsLoading(true)
    try {
      const shows = await searchShows(q)
      setSearchResults(shows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const retry = useCallback(() => {
    if (query.trim()) runSearch(query)
  }, [query, runSearch])

  // Client-side only; no mutation of searchResults (filter returns new arrays)
  const filteredResults = useMemo(() => {
    if (!query.trim() || searchResults.length === 0) return []
    const yearStr = String(year).trim()
    const genreStr = String(genre).trim()
    return searchResults.filter((show) => {
      if (yearStr && (!show.year || !String(show.year).includes(yearStr))) return false
      if (genreStr && (!show.genre || !show.genre.toLowerCase().includes(genreStr.toLowerCase()))) return false
      return true
    })
  }, [query, searchResults, year, genre])

  // Genres from current search results only; populated after data is loaded
  const genresFromResults = useMemo(() => {
    if (searchResults.length === 0) return []
    const set = new Set()
    searchResults.forEach((show) => {
      if (show.genre) {
        show.genre.split(' · ').forEach((g) => set.add(g.trim()))
      }
    })
    return [...set].sort()
  }, [searchResults])

  const hasSearchResults = searchResults.length > 0

  return {
    query,
    setQuery,
    year,
    setYear,
    genre,
    setGenre,
    runSearch,
    searchResults,
    filteredResults,
    genresFromResults,
    hasSearchResults,
    isLoading,
    error,
    retry,
  }
}
