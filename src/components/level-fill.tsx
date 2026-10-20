import {useEffect,useRef} from 'react';
import {Animated,Easing,Platform,View} from 'react-native';
import {useReducedMotion} from './use-reduced-motion';
import {motion, motionTransition} from '../theme/motion';
export function LevelFill({percent,color}:{percent:number;color:string}) {
 const value=Math.max(0,Math.min(100,percent));
 const reduced=useReducedMotion();
 const progress=useRef(new Animated.Value(value)).current;
 useEffect(()=>{
  if(Platform.OS==='web')return;
  const animation=Animated.timing(progress,{toValue:value,duration:reduced?0:motion.duration.transition,easing:Easing.bezier(...motion.curve),useNativeDriver:false,isInteraction:false});
  animation.start();return ()=>animation.stop();
 },[value,reduced,progress]);
 if(Platform.OS==='web')return <View style={{height:'100%',backgroundColor:color,width:`${value}%`,transition:reduced?'none':motionTransition('width',motion.duration.transition)} as never}/>;
 return <Animated.View style={{height:'100%',backgroundColor:color,width:progress.interpolate({inputRange:[0,100],outputRange:['0%','100%']})}}/>;
}
