import { useState, useCallback, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import TrailerModal from './components/TrailerModal'
import DiscoverPage from './pages/DiscoverPage'
import ReviewedPage from './pages/ReviewedPage'
import { useDiscoveryFeed } from './hooks/useDiscoveryFeed'
import { useSearchShows } from './hooks/useSearchShows'
import { useWatchedEpisodes } from './hooks/useWatchedEpisodes'

/**
 * App shell: view state, trailer modal, Discover (search + swipe) and Reviewed.
 * Discover uses search results as the swipe stack; persistence via useDiscoveryFeed.
 */
function App() {
  const [view, setView] = useState('swipe')
  const [trailerSeries, setTrailerSeries] = useState(null)

  const {
    matches,
    disliked,
    isLoading: discoveryLoading,
    isBusy: discoveryBusy,
    onSwipe: discoveryOnSwipe,
    restoreToDiscover,
    removeFromMatches,
    onReviewList: focusReviewed,
  } = useDiscoveryFeed()
  const { watched, toggleWatched } = useWatchedEpisodes()

  const {
    query,
    setQuery,
    year,
    setYear,
    genre,
    setGenre,
    runSearch,
    filteredResults,
    genresFromResults,
    isLoading: searchLoading,
    error: searchError,
    retry: searchRetry,
  } = useSearchShows()

  const [removedIds, setRemovedIds] = useState(() => new Set())

  useEffect(() => {
    setRemovedIds(new Set())
  }, [query])

  const stack = useMemo(
    () => filteredResults.filter((s) => !removedIds.has(s.id)),
    [filteredResults, removedIds]
  )

  const handleSwipe = useCallback(
    (show, direction) => {
      if (!show?.id) return
      setRemovedIds((prev) => new Set(prev).add(show.id))
      discoveryOnSwipe(show, direction)
    },
    [discoveryOnSwipe]
  )

  const hasCards = stack.length > 0
  const isBusy = searchLoading || discoveryBusy

  return (
    <div className="app" role="application" aria-label="BuskilzSeries TV discovery">
      <header className="header" role="banner">
        <span className="header__logo">BuskilzSeries</span>
        <nav className="header__nav" role="navigation" aria-label="Main">
          <button
            type="button"
            className={`header__tab ${view === 'swipe' ? 'header__tab--active' : ''}`}
            onClick={() => setView('swipe')}
            aria-label="Discover shows"
            aria-current={view === 'swipe' ? 'page' : undefined}
          >
            Discover
          </button>
          <button
            type="button"
            className={`header__tab ${view === 'reviewed' ? 'header__tab--active' : ''}`}
            onClick={() => setView('reviewed')}
            aria-label="Reviewed shows"
            aria-current={view === 'reviewed' ? 'page' : undefined}
          >
            Reviewed
            {(matches.length > 0 || disliked.length > 0) && (
              <span className="header__badge" aria-hidden>
                {matches.length + disliked.length}
              </span>
            )}
          </button>
        </nav>
      </header>

      <main className="main" role="main">
        <AnimatePresence mode="wait">
          {view === 'swipe' && (
            <DiscoverPage
              key="discover"
              stack={stack}
              hasCards={hasCards}
              isLoading={searchLoading}
              isBusy={isBusy}
              error={searchError}
              retry={searchRetry}
              onSwipe={handleSwipe}
              onCardExit={() => {}}
              onPlayTrailer={setTrailerSeries}
              onReviewList={() => setView('reviewed')}
              query={query}
              setQuery={setQuery}
              year={year}
              setYear={setYear}
              genre={genre}
              setGenre={setGenre}
              runSearch={runSearch}
              genresFromResults={genresFromResults}
            />
          )}
          {view === 'reviewed' && (
            <ReviewedPage
              key="reviewed"
              matches={matches}
              disliked={disliked}
              onPlayTrailer={setTrailerSeries}
              onRemove={removeFromMatches}
              onRestore={restoreToDiscover}
              watched={watched}
              onToggleWatched={toggleWatched}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence mode="wait">
        {trailerSeries && (
          <TrailerModal
            key={trailerSeries.id}
            series={trailerSeries}
            onClose={() => setTrailerSeries(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
