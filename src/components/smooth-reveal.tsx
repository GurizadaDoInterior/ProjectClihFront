import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useReducedMotion } from './use-reduced-motion';
import { motion } from '../theme/motion';
export function SmoothReveal({visible,children}:{visible:boolean;children:ReactNode}) {
  const reduced=useReducedMotion();
  const [height,setHeight]=useState(0);
  const progress=useRef(new Animated.Value(visible ? 1 : 0)).current;
  useEffect(()=>{
    const animation=Animated.timing(progress,{toValue:visible ? 1 : 0,duration:reduced ? 0 : visible ? motion.duration.reveal : motion.duration.exit,easing:Easing.bezier(...motion.curve),useNativeDriver:false,isInteraction:false});
    animation.start();return ()=>animation.stop();
  },[visible,reduced,progress]);
  return <Animated.View pointerEvents={visible ? 'auto' : 'none'} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'} style={{height:progress.interpolate({inputRange:[0,1],outputRange:[0,height]}),opacity:progress,overflow:'hidden'}}>
    <View onLayout={event=>setHeight(event.nativeEvent.layout.height)} style={{position:'absolute',top:0,left:0,right:0}}>{children}</View>
  </Animated.View>;
}
