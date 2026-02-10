/**
 * Search and filter hook for TV series.
 * Fetches from TVmaze search API; applies year and genre filters client-side.
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
      return
    }
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

  const filteredResults = useMemo(() => {
    let list = searchResults
    const yearStr = String(year).trim()
    if (yearStr) {
      list = list.filter((show) => show.year && String(show.year).includes(yearStr))
    }
    const genreStr = String(genre).trim()
    if (genreStr) {
      list = list.filter(
        (show) => show.genre && show.genre.toLowerCase().includes(genreStr.toLowerCase())
      )
    }
    return list
  }, [searchResults, year, genre])

  const genresFromResults = useMemo(() => {
    const set = new Set()
    searchResults.forEach((show) => {
      if (show.genre) {
        show.genre.split(' · ').forEach((g) => set.add(g.trim()))
      }
    })
    return [...set].sort()
  }, [searchResults])

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
    isLoading,
    error,
    retry,
  }
}
