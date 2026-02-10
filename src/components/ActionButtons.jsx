import { motion, AnimatePresence } from 'framer-motion'
import { NopeIcon, LikeIcon } from './Icons'

// Subtle tap feedback; avoids layout shift by using scale only
const tapScale = { scale: 0.92 }
const hoverScale = { scale: 1.06 }

/**
 * Like / Nope / Undo buttons with Framer Motion feedback.
 * Undo only shown when there is a last swiped card to revert.
 */
export default function ActionButtons({ onLike, onNope, onUndo, canUndo, disabled }) {
  return (
    <div className="actions">
      <motion.button
        type="button"
        className="actions__btn actions__btn--nope"
        onClick={onNope}
        disabled={disabled}
        aria-label="Skip series"
        whileHover={hoverScale}
        whileTap={tapScale}
      >
        <NopeIcon />
      </motion.button>

      <AnimatePresence>
        {canUndo && (
          <motion.button
            type="button"
            className="actions__btn actions__btn--undo"
            onClick={onUndo}
            aria-label="Undo last swipe"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            Undo
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="actions__btn actions__btn--like"
        onClick={onLike}
        disabled={disabled}
        aria-label="Add to list"
        whileHover={hoverScale}
        whileTap={tapScale}
      >
        <LikeIcon />
      </motion.button>
    </div>
  )
}
