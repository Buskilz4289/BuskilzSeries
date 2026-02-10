import { motion, AnimatePresence } from 'framer-motion'
import { getSeasons } from '../data/episodes'

export default function SeriesEpisodes({ series, watched, onToggleWatched }) {
  const seasons = getSeasons(series.id)
  const seriesWatched = watched[series.id] || {}
  const totalEpisodes = seasons.reduce((sum, s) => sum + s.episodes.length, 0)
  const watchedCount = Object.keys(seriesWatched).filter((id) => seriesWatched[id]).length

  if (seasons.length === 0) {
    return (
      <p className="episodes-empty">No episode data for this series.</p>
    )
  }

  return (
    <div className="episodes">
      <div className="episodes__progress">
        <span className="episodes__progress-text">
          {watchedCount} / {totalEpisodes} watched
        </span>
        <div className="episodes__progress-bar">
          <motion.span
            className="episodes__progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${totalEpisodes ? (watchedCount / totalEpisodes) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
            style={{ ['--accent']: series.accent }}
          />
        </div>
      </div>

      <div className="episodes__seasons">
        {seasons.map((season) => (
          <section key={season.seasonNumber} className="episodes__season">
            <h4 className="episodes__season-title">Season {season.seasonNumber}</h4>
            <ul className="episodes__list">
              {season.episodes.map((ep) => {
                const isWatched = !!seriesWatched[ep.id]
                return (
                  <li key={ep.id} className="episode-row">
                    <button
                      type="button"
                      className={`episode-row__check ${isWatched ? 'episode-row__check--watched' : ''}`}
                      onClick={() => onToggleWatched(series.id, ep.id)}
                      aria-label={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                      aria-pressed={isWatched}
                    >
                      {isWatched && <CheckIcon />}
                    </button>
                    <span className="episode-row__num">E{ep.number}</span>
                    <span className={`episode-row__title ${isWatched ? 'episode-row__title--watched' : ''}`}>
                      {ep.title}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
