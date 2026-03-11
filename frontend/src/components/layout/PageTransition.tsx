import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? {} : { opacity: 0, y: -8 }}
      transition={{ duration: reduced ? 0 : 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
