import { motion, AnimatePresence } from 'framer-motion'
import { PlayIcon, ChevronIcon } from './Icons'
import SeriesEpisodes from './SeriesEpisodes'
import { getSeasons } from '../data/episodes'

/**
 * Single card in Reviewed: liked (My List) or passed.
 * Liked cards show Episodes, Trailer, Remove; passed show "Back to Discover".
 */
export default function MatchCard({
  show,
  variant,
  isExpanded,
  onToggleExpand,
  onPlayTrailer,
  onRemove,
  onRestore,
  watched,
  onToggleWatched,
}) {
  const isLiked = variant === 'liked'
  const hasEpisodes = getSeasons(show.id).length > 0

  return (
    <motion.li
      className={`match-card ${variant === 'passed' ? 'match-card--passed' : ''}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ ['--accent']: show.accent }}
    >
      <div className="match-card__poster" style={{ background: show.gradient }} />
      <div className="match-card__info">
        <span className="match-card__genre">{show.genre}</span>
        <h3 className="match-card__title">{show.title}</h3>
        <span className="match-card__meta">
          {show.year} · {show.rating}
        </span>
        <div className="match-card__actions">
          {isLiked && hasEpisodes && (
            <button
              type="button"
              className={`match-card__episodes ${isExpanded ? 'match-card__episodes--open' : ''}`}
              onClick={() => onToggleExpand(show.id)}
            >
              <ChevronIcon open={isExpanded} /> Episodes
            </button>
          )}
          {isLiked && (
            <button type="button" className="match-card__trailer" onClick={() => onPlayTrailer(show)}>
              <PlayIcon size={18} /> Trailer
            </button>
          )}
          {isLiked && (
            <button
              type="button"
              className="match-card__remove"
              onClick={() => onRemove(show.id)}
              aria-label="Remove from list"
            >
              Remove
            </button>
          )}
          {variant === 'passed' && (
            <button type="button" className="match-card__restore" onClick={() => onRestore(show)}>
              Back to Discover
            </button>
          )}
        </div>
        <AnimatePresence>
          {isLiked && isExpanded && (
            <motion.div
              className="match-card__episodes-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SeriesEpisodes series={show} watched={watched} onToggleWatched={onToggleWatched} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}
