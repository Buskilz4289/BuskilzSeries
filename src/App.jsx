import { useState, useCallback, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import TrailerModal from './components/TrailerModal'
import DiscoverPage from './pages/DiscoverPage'
import ReviewedPage from './pages/ReviewedPage'
import { useDiscoveryFeed } from './hooks/useDiscoveryFeed'
import { useSearchShows } from './hooks/useSearchShows'
import { useWatchedEpisodes } from './hooks/useWatchedEpisodes'

/**
 * App shell: Discover (default) + Search (optional), single source of truth in useDiscoveryFeed.
 * Clearing search returns to Discover. Seen/liked/skipped shared and persisted.
 */
function App() {
  const [view, setView] = useState('swipe')
  const [trailerSeries, setTrailerSeries] = useState(null)

  const {
    stack: discoverStack,
    matches,
    disliked,
    seenIds,
    isLoading: discoveryLoading,
    isBusy: discoveryBusy,
    hasMore,
    error: discoveryError,
    retry: discoveryRetry,
    onSwipe: discoveryOnSwipe,
    onCardExit: discoveryOnCardExit,
    restoreToDiscover,
    removeFromMatches,
    seeSkippedAgain,
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

  const [searchRemovedIds, setSearchRemovedIds] = useState(() => new Set())
  useEffect(() => {
    setSearchRemovedIds(new Set())
  }, [query])

  const seenSet = useMemo(() => new Set(seenIds.map(String)), [seenIds])
  const searchStack = useMemo(
    () =>
      filteredResults.filter(
        (s) => !seenSet.has(String(s.id)) && !searchRemovedIds.has(s.id)
      ),
    [filteredResults, seenSet, searchRemovedIds]
  )

  const isSearchMode = query.trim().length > 0
  const displayStack = isSearchMode ? searchStack : discoverStack
  const hasCards = displayStack.length > 0
  const isLoading = isSearchMode ? searchLoading : discoveryLoading
  const error = isSearchMode ? searchError : discoveryError
  const retry = isSearchMode ? searchRetry : discoveryRetry
  const isBusy = searchLoading || discoveryBusy

  const handleSwipe = useCallback(
    (show, direction) => {
      if (!show?.id) return
      if (isSearchMode) setSearchRemovedIds((prev) => new Set(prev).add(show.id))
      discoveryOnSwipe(show, direction)
    },
    [discoveryOnSwipe, isSearchMode]
  )

  const onSwipe = handleSwipe
  const onCardExit = isSearchMode ? () => {} : discoveryOnCardExit

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
              stack={displayStack}
              hasCards={hasCards}
              isLoading={isLoading}
              isBusy={isBusy}
              error={error}
              retry={retry}
              onSwipe={onSwipe}
              onCardExit={onCardExit}
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
              isSearchMode={isSearchMode}
              hasMore={hasMore}
              seeSkippedAgain={seeSkippedAgain}
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
