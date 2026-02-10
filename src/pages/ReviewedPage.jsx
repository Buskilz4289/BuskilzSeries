import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MatchCard from '../components/MatchCard'
import EmptyStateMyList from '../components/EmptyStateMyList'

/**
 * Reviewed view: My List (liked) and Passed (skipped) with expandable episodes.
 */
export default function ReviewedPage({
  matches,
  disliked,
  onPlayTrailer,
  onRemove,
  onRestore,
  watched,
  onToggleWatched,
}) {
  const [expandedSeriesId, setExpandedSeriesId] = useState(null)

  return (
    <motion.div
      className="reviewed"
      role="region"
      aria-label="Reviewed shows"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {matches.length === 0 && disliked.length === 0 ? (
        <p className="matches__empty">
          Swipe on shows in Discover. Liked and passed series will appear here.
        </p>
      ) : (
        <>
          <section className="reviewed__section" aria-labelledby="my-list-title">
            <h2 id="my-list-title" className="matches__title">
              My List
            </h2>
            {matches.length === 0 ? (
              <EmptyStateMyList />
            ) : (
              <ul className="matches__list">
                <AnimatePresence mode="popLayout">
                  {matches.map((show) => (
                    <MatchCard
                      key={show.id}
                      show={show}
                      variant="liked"
                      isExpanded={expandedSeriesId === show.id}
                      onToggleExpand={(id) =>
                        setExpandedSeriesId((cur) => (cur === id ? null : id))
                      }
                      onPlayTrailer={onPlayTrailer}
                      onRemove={onRemove}
                      watched={watched}
                      onToggleWatched={onToggleWatched}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
          {disliked.length > 0 && (
            <section className="reviewed__section" aria-labelledby="passed-title">
              <h2 id="passed-title" className="matches__title">
                Passed
              </h2>
              <ul className="matches__list">
                <AnimatePresence mode="popLayout">
                  {disliked.map((show) => (
                    <MatchCard
                      key={show.id}
                      show={show}
                      variant="passed"
                      onRestore={onRestore}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}
        </>
      )}
    </motion.div>
  )
}
