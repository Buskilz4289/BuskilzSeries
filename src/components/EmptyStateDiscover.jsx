import { motion } from 'framer-motion'

/**
 * Shown when the discover stack is empty.
 * Optional emptyMessage/subMessage for search mode; otherwise exhausted/prompt copy.
 */
export default function EmptyStateDiscover({
  exhausted,
  onSeeSkippedAgain,
  onReviewList,
  emptyMessage,
  subMessage,
}) {
  const title = emptyMessage ?? (exhausted ? "You're all caught up" : 'No more shows')
  const sub = subMessage ?? (exhausted
    ? "You've seen everything in the catalog. See skipped shows again or review your list."
    : "You've seen everything in the stack. Try seeing skipped again or check your list.")

  return (
    <motion.div
      className="empty-state empty-state--discover"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
    >
      <span className="empty-state__icon" aria-hidden>
        {exhausted ? '✨' : '📺'}
      </span>
      <p className="empty-state__text">{title}</p>
      <p className="empty-state__sub">{sub}</p>
      <div className="empty-state__actions">
        {onSeeSkippedAgain && (
          <motion.button
            type="button"
            className="empty-state__btn empty-state__btn--primary"
            onClick={onSeeSkippedAgain}
            aria-label="See skipped shows again in discovery"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            See skipped again
          </motion.button>
        )}
        {onReviewList && (
          <motion.button
            type="button"
            className="empty-state__btn empty-state__btn--secondary"
            onClick={onReviewList}
            aria-label="Go to My List"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Review My List
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
