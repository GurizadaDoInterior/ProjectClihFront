import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from './use-reduced-motion';

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

  const duration = visible ? 560 : 520;
  return (
    <div
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
      style={{
        height: visible ? height : 0,
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: reduced ? 'none' : `height ${duration}ms cubic-bezier(.33,0,.2,1), opacity ${duration}ms ease`,
        pointerEvents: visible ? 'auto' : 'none',
      }}>
      <div ref={content}>{children}</div>
    </div>
  );
}
