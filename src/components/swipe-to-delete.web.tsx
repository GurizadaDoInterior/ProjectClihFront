import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Text } from 'react-native';
import { MotionPressable } from './motion-pressable';
import { useReducedMotion } from './use-reduced-motion';
import { shouldStartSwipe, swipeDestination, swipeOffset, SWIPE_WIDTH } from './swipe-gesture';
import { useTheme } from '@/src/theme/theme-provider';

export function SwipeToDelete({ children, disabled, onDelete }: { children: ReactNode; disabled?: boolean; onDelete: () => void }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  const blockedClickUntil = useRef(0);
  const gesture = useRef<{x:number;y:number;start:number;dragging:boolean;vertical:boolean;offset:number;pointer:number} | null>(null);
  const [open,setOpen] = useState(false);
  const settle = (offset:number) => {
    position.current = offset;
    setOpen(offset !== 0);
    if(content.current) {content.current.style.transition = reduced ? 'none' : 'transform 190ms cubic-bezier(.2,.8,.2,1)';content.current.style.transform=`translateX(${offset}px)`;}
  };
  useEffect(() => { if(disabled) {gesture.current=null;position.current=0;setOpen(false);if(content.current)content.current.style.transform='translateX(0)';} },[disabled]);
  return <div style={{position:'relative',overflow:'hidden',borderRadius:8}}>
    <MotionPressable accessibilityRole="button" accessibilityLabel="Excluir atividade" accessibilityElementsHidden={!open} importantForAccessibility={open ? 'yes' : 'no-hide-descendants'} disabled={!open || disabled} onPress={() => {settle(0);onDelete();}} style={{position:'absolute',right:0,top:0,bottom:9,width:SWIPE_WIDTH,alignItems:'center',justifyContent:'center',backgroundColor:colors.danger,borderRadius:8}}><Text style={{color:'#FFFFFF',fontWeight:'700'}}>Excluir</Text></MotionPressable>
    <div ref={content} style={{position:'relative',backgroundColor:colors.background,touchAction:'pan-y',userSelect:'none',willChange:'transform'}}
      onPointerDownCapture={event => {if(disabled || (event.pointerType==='mouse' && event.button!==0))return;gesture.current={x:event.clientX,y:event.clientY,start:position.current,offset:position.current,dragging:false,vertical:false,pointer:event.pointerId};}}
      onPointerMove={event => {
        const active=gesture.current;if(!active || active.pointer!==event.pointerId || active.vertical || disabled)return;
        const dx=event.clientX-active.x,dy=event.clientY-active.y;
        if(!active.dragging){if(Math.abs(dy)>8 && Math.abs(dy)>Math.abs(dx)){active.vertical=true;return;}if(!shouldStartSwipe(dx,dy,active.start<0))return;active.dragging=true;event.currentTarget.setPointerCapture(event.pointerId);if(content.current)content.current.style.transition='none';}
        event.preventDefault();active.offset=swipeOffset(active.start,dx);if(content.current)content.current.style.transform=`translateX(${active.offset}px)`;
      }}
      onPointerUp={event => {const active=gesture.current;if(!active || active.pointer!==event.pointerId)return;gesture.current=null;if(active.dragging){event.preventDefault();event.stopPropagation();blockedClickUntil.current=Date.now()+400;settle(swipeDestination(active.offset));if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}}
      onPointerCancel={() => {const active=gesture.current;gesture.current=null;if(active?.dragging){blockedClickUntil.current=Date.now()+400;settle(active.start);}}}
      onClickCapture={event => {if(Date.now()<blockedClickUntil.current || position.current<0){event.preventDefault();event.stopPropagation();if(Date.now()>=blockedClickUntil.current)settle(0);}}}
      onKeyDown={event => {if(event.key==='Escape')settle(0);}}>{children}</div>
  </div>;
}
