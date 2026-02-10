import { motion } from 'framer-motion'

/**
 * Shown when "My List" has no liked shows yet.
 * Directs user to Discover to swipe right.
 */
export default function EmptyStateMyList() {
  return (
    <motion.div
      className="empty-state empty-state--mylist"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="empty-state__icon empty-state__icon--heart" aria-hidden>
        ♡
      </span>
      <p className="empty-state__text">Your list is empty</p>
      <p className="empty-state__sub">Swipe right on shows you like in Discover to add them here.</p>
    </motion.div>
  )
}
