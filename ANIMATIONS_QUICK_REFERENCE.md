# Quick Animation Reference Guide

## Copy-Paste Animation Snippets

### 1. Animate a Page
```tsx
import { motion } from 'framer-motion';
import { containerVariants } from '@/lib/animations';

export default function MyPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Content */}
    </motion.div>
  );
}
```

### 2. Animate a List/Grid
```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item, i) => (
    <motion.div key={i} variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### 3. Scroll-Triggered Animation
```tsx
import { motion } from 'framer-motion';
import { containerVariants } from '@/lib/animations';

<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={containerVariants}
>
  Content animates on scroll
</motion.div>
```

### 4. Animated Card with Hover
```tsx
import { motion } from 'framer-motion';

<motion.div
  whileHover={{ y: -10 }}
  className="card"
>
  Content
</motion.div>
```

### 5. Animated Button
```tsx
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

### 6. Animated Form
```tsx
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

<motion.form
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {fields.map((field, i) => (
    <motion.div key={i} variants={itemVariants}>
      <input placeholder={field} />
    </motion.div>
  ))}
</motion.form>
```

### 7. Conditional Animation
```tsx
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useAnimations';

export function Component() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
    >
      Content
    </motion.div>
  );
}
```

### 8. Step/Modal Transition
```tsx
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { modalVariants } from '@/lib/animations';

<AnimatePresence mode="wait">
  {step === 'login' && (
    <motion.div key="login" variants={modalVariants}>
      Login Form
    </motion.div>
  )}
  {step === 'verify' && (
    <motion.div key="verify" variants={modalVariants}>
      Verify Form
    </motion.div>
  )}
</AnimatePresence>
```

### 9. Animated Icon
```tsx
import { motion } from 'framer-motion';

<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>
  <Icon />
</motion.div>
```

### 10. Staggered Text Animation
```tsx
import { motion } from 'framer-motion';
import { TextEffect } from '@/components/ui/text-effect';

<TextEffect 
  per="char" 
  preset="blur"
  className="text-3xl font-bold"
>
  Your animated text
</TextEffect>
```

## Common Patterns

### Fade In
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.5 }}
```

### Slide Up
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
```

### Scale In
```tsx
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
```

### Stagger Children (0.1s apart)
```tsx
transition={{
  staggerChildren: 0.1,
  delayChildren: 0.2,
}}
```

## Animation Properties

| Property | Value | Effect |
|----------|-------|--------|
| opacity | 0-1 | Fade effect |
| y | number | Vertical position |
| x | number | Horizontal position |
| scale | number | Size change |
| rotate | degrees | Rotation |
| filter | css | Blur, brightness, etc |

## Transition Timing

```tsx
// Spring physics (feels natural)
transition={{ type: 'spring', stiffness: 100 }}

// Eased (smooth and controlled)
transition={{ duration: 0.5, ease: 'easeInOut' }}

// With delay
transition={{ duration: 0.5, delay: 0.2 }}

// Staggered
transition={{ staggerChildren: 0.1 }}
```

## Helpful Variants to Import

```tsx
// Page/container level
import { 
  containerVariants,    // Parent with staggered children
  pageVariants,         // Page entrance animation
  staggerContainer,     // Customizable stagger
} from '@/lib/animations';

// Individual items
import {
  itemVariants,         // Fade + slide up
  slideInLeft,          // Slide from left
  slideInRight,         // Slide from right
  scaleIn,              // Scale up
  fadeIn,               // Fade in
} from '@/lib/animations';

// Interactions
import {
  hoverScale,           // Scale on hover
  hoverLift,            // Lift on hover
  buttonVariants,       // Button animations
} from '@/lib/animations';
```

## Tips

✅ **DO:**
- Use `opacity` and `transform` (GPU accelerated)
- Add `whileInView` for scroll animations
- Set `viewport={{ once: true }}` to prevent re-triggers
- Use spring physics for natural motion
- Test on mobile devices

❌ **DON'T:**
- Animate `width` or `height` (use `scale` instead)
- Animate too many elements at once
- Use linear timing for user interactions
- Forget `initial` and `animate`
- Ignore `prefers-reduced-motion`

## Testing Animations

Open DevTools and add to console:
```js
// Slow down animations 4x for testing
document.documentElement.style.animationPlaybackRate = '0.25';
```

## Performance Check

In DevTools Performance tab:
- Look for 60fps solid line (green)
- Avoid frame drops during animations
- Check GPU usage with DevTools rendering tab
