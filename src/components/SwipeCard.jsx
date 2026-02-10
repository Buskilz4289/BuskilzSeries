import { useRef, useImperativeHandle, forwardRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { PlayIcon } from './Icons'

// Subtle entrance: cards animate in when they enter the stack (e.g. after undo or start over)
const cardEntrance = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

const SwipeCard = forwardRef(function SwipeCard({ series, onSwipe, onCardExit, onPlayTrailer, isTop }, ref) {
  const x = useMotionValue(0)
  const opacity = useMotionValue(1)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const opacityLike = useTransform(x, [0, 120], [0, 1])
  const opacityNope = useTransform(x, [-120, 0], [1, 0])
  const cardRef = useRef(null)

  const runExit = (dir) => {
    const toX = dir === 'right' ? 400 : -400
    onSwipe(series, dir)
    const controls = animate(x, toX, {
      type: 'tween',
      duration: 0.25,
      onComplete: () => onCardExit?.(series?.id),
    })
    animate(opacity, 0, { type: 'tween', duration: 0.2 })
    return () => controls.stop()
  }

  useImperativeHandle(ref, () => ({
    swipe: (dir) => {
      runExit(dir)
    },
  }))

  const handleDragEnd = (_, info) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      runExit('right')
    } else if (info.offset.x < -threshold) {
      runExit('left')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  return (
    <motion.article
      ref={cardRef}
      className="swipe-card"
      {...cardEntrance}
      style={{
        x,
        opacity,
        rotate,
        zIndex: isTop ? 10 : 5,
        pointerEvents: isTop ? 'auto' : 'none',
        background: series.gradient,
        boxShadow: isTop ? '0 25px 80px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' : '0 10px 40px -10px rgba(0,0,0,0.4)',
        ['--accent']: series.accent,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="swipe-card__poster">
        <span className="swipe-card__rating">{series.rating}</span>
        <span className="swipe-card__year">{series.year}</span>
      </div>

      <div className="swipe-card__content">
        <span className="swipe-card__genre">{series.genre}</span>
        <h2 className="swipe-card__title">{series.title}</h2>
        <p className="swipe-card__desc">{series.description}</p>
        {isTop && onPlayTrailer && (
          <button
            type="button"
            className="swipe-card__trailer"
            onClick={(e) => { e.stopPropagation(); onPlayTrailer() }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <PlayIcon size={16} /> Watch trailer
          </button>
        )}
      </div>

      {/* Overlay labels when dragging */}
      <motion.span className="swipe-card__label swipe-card__label--like" style={{ opacity: opacityLike }}>
        LIKE
      </motion.span>
      <motion.span className="swipe-card__label swipe-card__label--nope" style={{ opacity: opacityNope }}>
        NOPE
      </motion.span>

    </motion.article>
  )
})

export default SwipeCard
