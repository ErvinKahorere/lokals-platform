import { AnimatePresence, motion } from 'framer-motion'

export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close sheet"
            className="fixed inset-0 z-40 bg-slate-950/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 250, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-lokals-surface p-5 shadow-soft-lg md:hidden"
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-lokals-border/45" />
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
