import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from './use-reduced-motion';
import { motion, motionTransition } from '../theme/motion';

export function SmoothReveal({ visible, children }: { visible: boolean; children: ReactNode }) {
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const duration = visible ? motion.duration.reveal : motion.duration.exit;
  return (
    <div
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
      style={{
        height: visible ? height : 0,
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: reduced ? 'none' : `${motionTransition('height', duration)}, ${motionTransition('opacity', duration)}`,
        pointerEvents: visible ? 'auto' : 'none',
      }}>
      <div ref={content}>{children}</div>
    </div>
  );
}
