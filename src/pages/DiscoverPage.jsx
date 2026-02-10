import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SwipeCard from '../components/SwipeCard'
import ActionButtons from '../components/ActionButtons'
import EmptyStateDiscover from '../components/EmptyStateDiscover'
import StackSkeleton from '../components/StackSkeleton'

/**
 * Discover view: swipeable feed, actions, and empty/loading states.
 * Keyboard: Arrow keys trigger swipe when cards are present.
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
  undo,
  lastSwiped,
  onPlayTrailer,
  seeSkippedAgain,
  hasMore,
  onReviewList,
}) {
  const topCardRef = useRef(null)
  const handleLike = () => topCardRef.current?.swipe('right')
  const handleNope = () => topCardRef.current?.swipe('left')

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
  const showExhausted = showEmpty && !hasMore

  return (
    <>
      <div className="stack" role="region" aria-label="Discovery stack">
        <AnimatePresence mode="popLayout">
          {stack.map((series, index) => (
            <SwipeCard
              key={series.id}
              ref={index === 0 ? topCardRef : null}
              series={series}
              onSwipe={onSwipe}
              onCardExit={onCardExit}
              onPlayTrailer={series.trailerId ? () => onPlayTrailer(series) : undefined}
              isTop={index === 0}
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
              aria-label="Retry loading shows"
            >
              Retry
            </button>
          </div>
        )}
        {showEmpty && (
          <EmptyStateDiscover
            exhausted={showExhausted}
            onSeeSkippedAgain={seeSkippedAgain}
            onReviewList={onReviewList}
          />
        )}
      </div>

      {hasCards && (
        <ActionButtons
          onLike={handleLike}
          onNope={handleNope}
          onUndo={undo}
          canUndo={!!lastSwiped}
          disabled={isBusy}
        />
      )}

      {hasCards && (
        <>
          <p className="hint" id="discover-hint">
            Swipe or use arrow keys ← →
          </p>
          {isLoading && (
            <p className="hint hint--loading" aria-live="polite">
              Loading more…
            </p>
          )}
        </>
      )}
    </>
  )
}
