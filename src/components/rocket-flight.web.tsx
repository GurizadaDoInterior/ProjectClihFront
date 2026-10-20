import type { PropsWithChildren } from 'react';
import { useReducedMotion } from './use-reduced-motion';

// Browser-managed transform/opacity loops leave JS free to handle clicks.
export function RocketFlight({ active, color, children }: PropsWithChildren<{ active: boolean; color: string }>) {
  const reduced = useReducedMotion();
  const enabled = active && !reduced;
  return <div style={{ position: 'relative' }}>
    {enabled ? <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {[0, 1, 2, 3].map(index => <div key={index} style={{ position: 'absolute', left: `calc(24% - ${index * 7}px)`, top: `${45 + index * 7}%` }}>
        <span className="clih-ambient" style={{ display: 'block', width: 22 + index * 6, height: 2, borderRadius: 2, backgroundColor: color,
          animation: 'clih-trail 650ms linear infinite', animationDelay: `-${index * 120}ms` }} />
      </div>)}
    </div> : null}
    <div className="clih-ambient" style={{ animation: enabled ? 'clih-drift 1300ms ease-in-out infinite' : 'none' }}>{children}</div>
  </div>;
}
