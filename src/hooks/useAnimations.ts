import { Variants } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Hook to get reduced motion preference based on system settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to create responsive animation variants
 */
export function useResponsiveAnimation(mobileVariants: Variants, desktopVariants: Variants): Variants {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? mobileVariants : desktopVariants;
}

/**
 * Hook for staggered animation with custom delays
 */
export function useStaggerAnimation(itemCount: number, staggerDelay: number = 0.1) {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  };
}

/**
 * Hook for in-viewport animation with scroll trigger
 */
export function useInViewAnimation() {
  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true, amount: 0.3 },
  };
}

/**
 * Create animation delays array for indexed animations
 */
export function createDelayArray(length: number, baseDelay: number = 0.1): number[] {
  return Array.from({ length }, (_, i) => i * baseDelay);
}

/**
 * Merge animation variants with transition timing
 */
export function mergeAnimationVariants(
  baseVariants: Variants,
  transitionOverrides: Record<string, any> = {}
): Variants {
  const merged: Variants = {};

  for (const key in baseVariants) {
    const variant = baseVariants[key as keyof Variants];
    if (typeof variant === 'object' && variant !== null && 'transition' in variant) {
      merged[key] = {
        ...variant,
        transition: { ...variant.transition, ...transitionOverrides },
      };
    } else {
      merged[key] = variant;
    }
  }

  return merged;
}

/**
 * Get animation variants with reduced motion support
 */
export function useAnimationWithReducedMotion(
  variants: Variants,
  reducedVariants?: Variants
): Variants {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion && reducedVariants ? reducedVariants : variants;
}

/**
 * Hook for scroll-based animations
 */
export function useScrollAnimation(triggerPoint: number = 0.3) {
  return {
    initial: 'hidden',
    animate: 'visible',
    whileInView: 'visible',
    viewport: { once: true, amount: triggerPoint },
  };
}
