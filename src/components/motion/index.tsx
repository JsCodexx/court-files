import React from 'react';
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from 'framer-motion';
import {
  fadeHidden,
  fadeUpHidden,
  fadeUpVisible,
  fadeVisible,
  staggerContainer,
  staggerItem,
  transitionFast,
  transitionPage,
  transitionReveal,
  viewportOnce,
} from '../../motion/presets';
import { cn } from '../../lib/utils';

type MotionDivProps = HTMLMotionProps<'div'>;

export function PageEnter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : fadeUpHidden}
      animate={fadeUpVisible}
      transition={transitionPage}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Skip scroll-triggered animation (e.g. hero above the fold). */
  asChild?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  if (asChild) {
    return (
      <motion.div
        className={className}
        initial={fadeUpHidden}
        animate={fadeUpVisible}
        transition={{ ...transitionReveal, delay }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={fadeUpHidden}
      whileInView={fadeUpVisible}
      viewport={viewportOnce}
      transition={{ ...transitionReveal, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  inView = true,
}: {
  children: React.ReactNode;
  className?: string;
  inView?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const props: MotionDivProps = inView
    ? {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: viewportOnce,
      }
    : {
        initial: 'hidden',
        animate: 'visible',
      };

  return (
    <motion.div className={className} variants={staggerContainer} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

export function Fade({
  children,
  className,
  show = true,
}: {
  children: React.ReactNode;
  className?: string;
  show?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return show ? <div className={className}>{children}</div> : null;
  }
  return (
    <motion.div
      className={className}
      initial={false}
      animate={show ? fadeVisible : fadeHidden}
      transition={transitionFast}
    >
      {children}
    </motion.div>
  );
}

export function MotionPopover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={transitionFast}
    >
      {children}
    </motion.div>
  );
}

export { motion, staggerItem as motionStaggerItemVariants };
export type { Variants };
