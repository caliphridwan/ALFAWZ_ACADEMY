"use client";

import { motion } from "framer-motion";

/**
 * Wraps a section so it gently fades/slides into place the first time it
 * scrolls into view, instead of just appearing instantly. This is what
 * gives scrolling a sense of motion on ordinary desktop/Android browsers,
 * which have no native "bounce" physics to borrow from — iOS Safari's own
 * rubber-band overscroll already happens for free (see globals.css) and
 * needs nothing further.
 *
 * Deliberately subtle per Section 49: tasteful micro-interactions, not
 * gimmicky — short distance, short duration, plays once per element.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
