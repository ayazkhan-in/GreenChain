import { Variants } from 'framer-motion';

// Page transition animations
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// Container animations
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Individual item animations
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

// Slide in from top
export const slideInTop: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Scale animation
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// Fade animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

// Rotate animation
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: { opacity: 1, rotate: 0, transition: { duration: 0.5 } },
};

// Staggered list animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 },
};

export const hoverLift = {
  whileHover: { y: -5, transition: { duration: 0.2 } },
};

// Card animation
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { y: -10, transition: { duration: 0.2 } },
};

// Button animation
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 17 } },
  tap: { scale: 0.95 },
};

// Pulse animation
export const pulseVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// Blur slide variants (for text effects)
export const blurSlideVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.01 },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(10px) brightness(0%)',
      y: 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px) brightness(100%)',
      transition: {
        duration: 0.4,
      },
    },
  },
};

// Modal animations
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

// Bottom sheet animation
export const bottomSheetVariants: Variants = {
  hidden: { y: 1000 },
  visible: { y: 0, transition: { type: 'spring', damping: 40 } },
  exit: { y: 1000, transition: { duration: 0.3 } },
};
