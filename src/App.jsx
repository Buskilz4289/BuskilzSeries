import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import TrailerModal from './components/TrailerModal'
import DiscoverPage from './pages/DiscoverPage'
import ReviewedPage from './pages/ReviewedPage'
import { useDiscoveryFeed } from './hooks/useDiscoveryFeed'
import { useWatchedEpisodes } from './hooks/useWatchedEpisodes'

/**
 * App shell: view state, trailer modal, and two main views (Discover / Reviewed).
 * Discovery and persistence are centralized in useDiscoveryFeed and useWatchedEpisodes.
 */
function App() {
  const [view, setView] = useState('swipe')
  const [trailerSeries, setTrailerSeries] = useState(null)

  const {
    stack,
    matches,
    disliked,
    lastSwiped,
    isLoading,
    isBusy,
    hasCards,
    hasMore,
    error,
    retry,
    onSwipe,
    onCardExit,
    undo,
    restoreToDiscover,
    removeFromMatches,
    seeSkippedAgain,
  } = useDiscoveryFeed()
  const { watched, toggleWatched } = useWatchedEpisodes()

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
              isLoading={isLoading}
              isBusy={isBusy}
              error={error}
              retry={retry}
              onSwipe={onSwipe}
              onCardExit={onCardExit}
              undo={undo}
              lastSwiped={lastSwiped}
              onPlayTrailer={setTrailerSeries}
              seeSkippedAgain={seeSkippedAgain}
              hasMore={hasMore}
              onReviewList={() => setView('reviewed')}
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
