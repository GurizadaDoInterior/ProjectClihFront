import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Text } from 'react-native';
import { MotionPressable } from './motion-pressable';
import { useReducedMotion } from './use-reduced-motion';
import { shouldStartSwipe, swipeDestination, swipeOffset, isFullSwipe, SWIPE_WIDTH } from './swipe-gesture';
import { useTheme } from '@/src/theme/theme-provider';

export function SwipeToDelete({ children, disabled, onDelete, onFullSwipe }: { children: ReactNode; disabled?: boolean; onDelete: () => void; onFullSwipe?: () => Promise<unknown> }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  const committing = useRef(false);
  const label = useRef<HTMLSpanElement>(null);
  const blockedClickUntil = useRef(0);
  const gesture = useRef<{x:number;y:number;start:number;dragging:boolean;vertical:boolean;offset:number;pointer:number} | null>(null);
  const [open,setOpen] = useState(false);
  const settle = (offset:number) => {
    position.current = offset;
    setOpen(offset !== 0);
    if(content.current) {content.current.style.transition = reduced ? 'none' : 'transform 260ms cubic-bezier(.22,1,.36,1)';content.current.style.transform=`translateX(${offset}px)`;}
  };
  useEffect(() => { if(disabled && !committing.current) {gesture.current=null;position.current=0;setOpen(false);if(content.current)content.current.style.transform='translateX(0)';} },[disabled]);
  return <div style={{position:'relative',overflow:'hidden',borderRadius:8}}>
    <MotionPressable accessibilityRole="button" accessibilityLabel="Excluir atividade" accessibilityElementsHidden={!open} importantForAccessibility={open ? 'yes' : 'no-hide-descendants'} disabled={!open || disabled} onPress={() => {settle(0);onDelete();}} style={{position:'absolute',right:0,top:0,bottom:9,width:'100%',paddingRight:24,alignItems:'flex-end',justifyContent:'center',backgroundColor:colors.danger,borderRadius:8}}><span ref={label} style={{color:'#FFFFFF',fontWeight:700,fontSize:14}}>Excluir</span></MotionPressable>
    <div ref={content} style={{position:'relative',backgroundColor:colors.background,touchAction:'pan-y',userSelect:'none',willChange:'transform'}}
      onPointerDownCapture={event => {if(disabled || (event.pointerType==='mouse' && event.button!==0))return;gesture.current={x:event.clientX,y:event.clientY,start:position.current,offset:position.current,dragging:false,vertical:false,pointer:event.pointerId};}}
      onPointerMove={event => {
        const active=gesture.current;if(!active || active.pointer!==event.pointerId || active.vertical || disabled)return;
        const dx=event.clientX-active.x,dy=event.clientY-active.y;
        if(!active.dragging){if(Math.abs(dy)>8 && Math.abs(dy)>Math.abs(dx)){active.vertical=true;return;}if(!shouldStartSwipe(dx,dy,active.start<0))return;active.dragging=true;event.currentTarget.setPointerCapture(event.pointerId);if(content.current)content.current.style.transition='none';}
        event.preventDefault();active.offset=swipeOffset(active.start,dx,event.currentTarget.clientWidth);if(label.current)label.current.textContent=isFullSwipe(active.offset,event.currentTarget.clientWidth) ? 'Solte para excluir' : 'Excluir';if(content.current)content.current.style.transform=`translateX(${active.offset}px)`;
      }}
      onPointerUp={event => {const active=gesture.current;if(!active || active.pointer!==event.pointerId)return;gesture.current=null;if(active.dragging){event.preventDefault();event.stopPropagation();blockedClickUntil.current=Date.now()+400;const width=event.currentTarget.clientWidth;if(isFullSwipe(active.offset,width) && onFullSwipe && !committing.current){committing.current=true;settle(-width);if(label.current)label.current.textContent='Excluindo...';Promise.resolve().then(onFullSwipe).catch(()=>{committing.current=false;settle(0);if(label.current)label.current.textContent='Excluir';});}else{settle(swipeDestination(active.offset));}if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}}
      onPointerCancel={() => {const active=gesture.current;gesture.current=null;if(active?.dragging){blockedClickUntil.current=Date.now()+400;settle(active.start);}}}
      onClickCapture={event => {if(Date.now()<blockedClickUntil.current || position.current<0){event.preventDefault();event.stopPropagation();if(Date.now()>=blockedClickUntil.current)settle(0);}}}
      onKeyDown={event => {if(event.key==='Escape')settle(0);}}>{children}</div>
  </div>;
}
