import type { ReactNode } from 'react';
import { useReducedMotion } from './use-reduced-motion';
export function SmoothReveal({visible,children}:{visible:boolean;children:ReactNode}) {
  const reduced=useReducedMotion();
  return <div aria-hidden={!visible} inert={!visible ? true : undefined} style={{display:'grid',gridTemplateRows:visible ? '1fr' : '0fr',opacity:visible ? 1 : 0,transition:reduced ? 'none' : 'grid-template-rows 320ms cubic-bezier(.16,1,.3,1), opacity 220ms ease',pointerEvents:visible ? 'auto' : 'none'}}>
    <div style={{minHeight:0,overflow:'hidden'}}>{children}</div>
  </div>;
}
