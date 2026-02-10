import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CloseIcon } from './Icons'

const YOUTUBE_EMBED = 'https://www.youtube.com/embed/'

/** Build YouTube search URL for "{title} trailer" fallback when no embed id. */
function youtubeSearchUrl(title) {
  const query = encodeURIComponent(`${title || 'TV series'} trailer`)
  return `https://www.youtube.com/results?search_query=${query}`
}

export default function TrailerModal({ series, onClose }) {
  const closeRef = useRef(null)
  const previousActiveRef = useRef(null)

  useEffect(() => {
    previousActiveRef.current = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (previousActiveRef.current?.focus) previousActiveRef.current.focus()
    }
  }, [onClose])

  if (!series?.title) return null

  const hasEmbed = Boolean(series.trailerId)
  const embedUrl = hasEmbed ? `${YOUTUBE_EMBED}${series.trailerId}?autoplay=1` : null
  const searchUrl = youtubeSearchUrl(series.title)

  return (
    <motion.div
      className="trailer-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="trailer-modal__box"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="trailer-modal__header">
          <h3 id="trailer-modal-title" className="trailer-modal__title">{series.title} — Trailer</h3>
          <button
            ref={closeRef}
            type="button"
            className="trailer-modal__close"
            onClick={onClose}
            aria-label="Close trailer"
          >
            <CloseIcon size={24} />
          </button>
        </div>
        {hasEmbed ? (
          <>
            <div className="trailer-modal__video">
              <iframe
                src={embedUrl}
                title={`${series.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${series.trailerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="trailer-modal__link"
            >
              Watch on YouTube ↗
            </a>
          </>
        ) : (
          <div className="trailer-modal__fallback">
            <p className="trailer-modal__fallback-text">No trailer embed for this show.</p>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="trailer-modal__link trailer-modal__link--primary"
            >
              Search “{series.title} trailer” on YouTube ↗
            </a>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

