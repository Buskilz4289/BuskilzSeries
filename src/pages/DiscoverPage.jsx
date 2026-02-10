import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SwipeCard from '../components/SwipeCard'
import SearchBar from '../components/SearchBar'
import EmptyStateDiscover from '../components/EmptyStateDiscover'
import StackSkeleton from '../components/StackSkeleton'

/**
 * Discover view: search bar (optional) above Discover feed. Default is Discover; clearing search returns to it.
 * Single stack: Discover feed or Search results; same liked/skipped/seen state.
 */
export default function DiscoverPage({
  stack,
  hasCards,
  isLoading,
  isBusy,
  error,
  retry,
  onSwipe,
  onCardExit,
  onPlayTrailer,
  onReviewList,
  query,
  setQuery,
  year,
  setYear,
  genre,
  setGenre,
  runSearch,
  genresFromResults,
  isSearchMode,
  hasMore,
  seeSkippedAgain,
}) {
  const topCardRef = useRef(null)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!hasCards || isBusy) return
      if (e.key === 'ArrowRight') topCardRef.current?.swipe('right')
      if (e.key === 'ArrowLeft') topCardRef.current?.swipe('left')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasCards, isBusy])

  const showEmpty = !hasCards && !isLoading && !error
  const showNoResults = showEmpty && isSearchMode
  const showDiscoverEmpty = showEmpty && !isSearchMode

  return (
    <>
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={runSearch}
        year={year}
        onYearChange={setYear}
        genre={genre}
        onGenreChange={setGenre}
        genresFromResults={genresFromResults}
        isLoading={isLoading}
        disabled={isBusy}
      />

      <div className="stack" role="region" aria-label="Discovery stack">
        <AnimatePresence mode="popLayout">
          {stack.map((series, index) => (
            <SwipeCard
              key={series.id}
              ref={index === 0 ? topCardRef : null}
              series={series}
              onSwipe={onSwipe}
              onCardExit={onCardExit}
              onPlayTrailer={() => onPlayTrailer(series)}
              isTop={index === 0}
              disabled={isBusy}
            />
          ))}
        </AnimatePresence>
        {isLoading && !hasCards && !error && <StackSkeleton />}
        {error && (
          <div className="empty-state empty-state--error" role="alert">
            <span className="empty-state__icon" aria-hidden>⚠️</span>
            <p className="empty-state__text">Something went wrong</p>
            <p className="empty-state__sub">{error}</p>
            <button
              type="button"
              className="empty-state__btn empty-state__btn--primary"
              onClick={retry}
              aria-label="Retry search"
            >
              Retry
            </button>
          </div>
        )}
        {showDiscoverEmpty && (
          <EmptyStateDiscover
            exhausted={!hasMore}
            onSeeSkippedAgain={seeSkippedAgain}
            onReviewList={onReviewList}
          />
        )}
        {showNoResults && (
          <EmptyStateDiscover
            exhausted={false}
            onReviewList={onReviewList}
            emptyMessage="No results"
            subMessage="Try a different search or clear the search to return to Discover."
          />
        )}
      </div>

      {hasCards && (
        <p className="hint" id="discover-hint">
          Swipe or use arrow keys ← →
        </p>
      )}
    </>
  )
}
