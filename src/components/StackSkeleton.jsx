import { motion } from 'framer-motion'

/** Placeholder cards while the discovery feed is loading. */
export default function StackSkeleton() {
  return (
    <div className="stack stack--skeleton" aria-live="polite" aria-busy="true">
      <motion.div
        className="swipe-card swipe-card--skeleton"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}
