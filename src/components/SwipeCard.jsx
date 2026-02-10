import { useRef, useImperativeHandle, forwardRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { PlayIcon } from './Icons'

// Industry standard: right = LIKE, left = NOPE
const SWIPE_THRESHOLD_PX = 100
const VELOCITY_THRESHOLD = 500
const EXIT_OFFSET_PX = 400

const cardEntrance = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

const SwipeCard = forwardRef(function SwipeCard(
  { series, onSwipe, onCardExit, onPlayTrailer, isTop, disabled = false },
  ref
) {
  const x = useMotionValue(0)
  const opacity = useMotionValue(1)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const opacityLike = useTransform(x, [0, SWIPE_THRESHOLD_PX], [0, 1])
  const opacityNope = useTransform(x, [-SWIPE_THRESHOLD_PX, 0], [1, 0])
  const cardRef = useRef(null)
  const isExitingRef = useRef(false)

  const runExit = (dir) => {
    if (isExitingRef.current) return
    isExitingRef.current = true
    const toX = dir === 'right' ? EXIT_OFFSET_PX : -EXIT_OFFSET_PX
    onSwipe(series, dir)
    animate(x, toX, {
      type: 'tween',
      duration: 0.25,
      ease: 'easeOut',
      onComplete: () => {
        onCardExit?.(series?.id)
        isExitingRef.current = false
      },
    })
    animate(opacity, 0, { type: 'tween', duration: 0.2 })
  }

  useImperativeHandle(ref, () => ({
    swipe: (dir) => {
      if (!isExitingRef.current && (dir === 'right' || dir === 'left')) runExit(dir)
    },
  }))

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info
    const fastFlickRight = velocity.x > VELOCITY_THRESHOLD
    const fastFlickLeft = velocity.x < -VELOCITY_THRESHOLD
    if (offset.x > SWIPE_THRESHOLD_PX || fastFlickRight) {
      runExit('right')
    } else if (offset.x < -SWIPE_THRESHOLD_PX || fastFlickLeft) {
      runExit('left')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  const canInteract = isTop && !disabled

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
        pointerEvents: canInteract ? 'auto' : 'none',
        background: series.gradient,
        boxShadow: isTop ? '0 25px 80px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' : '0 10px 40px -10px rgba(0,0,0,0.4)',
        ['--accent']: series.accent,
      }}
      drag={canInteract ? 'x' : false}
      dragConstraints={{ left: -EXIT_OFFSET_PX, right: EXIT_OFFSET_PX }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="swipe-card__poster">
        {series.posterUrl && (
          <img
            src={series.posterUrl}
            alt=""
            className="swipe-card__poster-img"
          />
        )}
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
