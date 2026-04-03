# Framer Motion Animation System Guide

This guide explains how to use the comprehensive animation system implemented across the GreenChain application using Framer Motion.

## Quick Start

### 1. **Pre-built Animation Variants** (`/lib/animations.ts`)

Ready-to-use animation patterns that can be applied to any element:

```tsx
import { containerVariants, itemVariants, slideInLeft, cardVariants } from '@/lib/animations';

// Use with motion components
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {children}
</motion.div>
```

### 2. **Reusable Wrapper Components**

#### AnimatedPage
Wraps entire page content with standard entrance animation:
```tsx
import AnimatedPage from '@/components/AnimatedPage';

export default function MyPage() {
  return (
    <AnimatedPage>
      <h1>Your Content</h1>
    </AnimatedPage>
  );
}
```

#### AnimatedCard
Adds fade-in, lift on hover animations to cards:
```tsx
import AnimatedCard from '@/components/AnimatedCard';

export default function Dashboard() {
  return (
    <AnimatedCard index={0}>
      <div className="card">Content</div>
    </AnimatedCard>
  );
}
```

#### AnimatedButton
Adds scale and tap animations to buttons:
```tsx
import AnimatedButton from '@/components/AnimatedButton';

<AnimatedButton onClick={handleClick}>
  Click Me
</AnimatedButton>
```

## Available Animation Presets

### Page Transitions
- `pageVariants` - Fade in with slide up effect

### Container & Item Animations
- `containerVariants` - Parent container with staggered children
- `itemVariants` - Child items that fade and slide up
- `staggerContainer` - Container with configurable stagger
- `staggerItem` - Items for staggered animations

### Directional Animations
- `slideInLeft` - Slide from left with fade
- `slideInRight` - Slide from right with fade  
- `slideInTop` - Slide from top with fade

### Effect Animations
- `scaleIn` - Scale up from 0.8 opacity
- `fadeIn` - Simple fade in
- `rotateIn` - Rotate in with fade
- `pulseVariants` - Infinite pulsing effect

### Interaction Animations
- `hoverScale` - Scale 1.05 on hover
- `hoverLift` - Lift up (y: -5) on hover
- `cardVariants` - Complete card animation lifecycle
- `buttonVariants` - Button click animations

### Specialized Animations
- `blurSlideVariants` - Character-by-character blur effect
- `modalVariants` - Modal entrance/exit
- `bottomSheetVariants` - Bottom sheet slide up

## Usage Examples

### Example 1: Staggered List of Cards
```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function CardGrid({ items }) {
  return (
    <motion.div 
      variants={staggerContainer} 
      initial="hidden" 
      animate="visible"
      className="grid gap-4"
    >
      {items.map((item, index) => (
        <motion.div 
          key={index} 
          variants={staggerItem}
          whileHover={{ y: -5 }}
        >
          {/* Card content */}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Example 2: Scroll-Triggered Animation
```tsx
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={containerVariants}
>
  {children}
</motion.div>
```

### Example 3: Page Transition with Steps
```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  {step === 'login' && <LoginForm key="login" />}
  {step === 'verify' && <VerifyForm key="verify" />}
</AnimatePresence>
```

### Example 4: Animated Form
```tsx
import { motion } from 'framer-motion';

<motion.form
  initial="hidden"
  animate="visible"
  variants={containerVariants}
>
  {formFields.map((field, index) => (
    <motion.div key={index} variants={itemVariants}>
      <input placeholder={field.label} />
    </motion.div>
  ))}
</motion.form>
```

## Pages with Animations

The following pages have been enhanced with comprehensive animations:

1. **Landing.tsx** - Hero text effects, card animations, CTA animations
2. **ConnectWallet.tsx** - Step transitions, role selection animations
3. **FarmerDashboard.tsx** - Ready for card animations
4. **CompanyDashboard.tsx** - Ready for dashboard grid animations
5. **AdminPanel.tsx** - Ready for list animations

## Best Practices

1. **Use `whileInView` for scroll animations** - Animations trigger when element comes into view
2. **Set `viewport={{ once: true }}`** - Prevents re-triggering animations on scroll
3. **Stagger children appropriately** - 0.05-0.15s between items looks natural
4. **Test on mobile** - Some animations may feel sluggish on slower devices
5. **Avoid animating too many properties** - Keep it lightweight for better performance
6. **Use spring physics for interactions** - More natural than linear timing

## Performance Tips

- Use `will-change` CSS for frequently animated elements
- Prefer `opacity` and `transform` animations (GPU accelerated)
- Avoid animating width/height, use `scaleX`/`scaleY` instead
- Use `layout` animations sparingly
- Consider reducing animations on low-end devices

## Customization

### Custom Variants
```tsx
const customVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      delay: 0.2 
    }
  }
};
```

### Conditional Animations
```tsx
const variants = isMobile ? mobileVariants : desktopVariants;
```

## Troubleshooting

- **Animations not triggering?** Check `initial` and `animate` are set correctly
- **Stuttering performance?** Reduce number of animated elements or use `reduceMotion`
- **Elements jumping?** Ensure layout props are properly configured
- **Text selection issues?** Add `user-select-none` to animated text elements

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Performance Tips](https://www.framer.com/motion/performance/)
- [Gesture Animations](https://www.framer.com/motion/gestures/)
