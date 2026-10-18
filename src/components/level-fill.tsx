import {useEffect,useRef} from 'react';
import {Animated,Easing,Platform,View} from 'react-native';
import {useReducedMotion} from './use-reduced-motion';
export function LevelFill({percent,color}:{percent:number;color:string}) {
 const value=Math.max(0,Math.min(100,percent));
 const reduced=useReducedMotion();
 const progress=useRef(new Animated.Value(value)).current;
 useEffect(()=>{
  if(Platform.OS==='web')return;
  const animation=Animated.timing(progress,{toValue:value,duration:reduced?0:220,easing:Easing.out(Easing.cubic),useNativeDriver:false});
  animation.start();return ()=>animation.stop();
 },[value,reduced,progress]);
 if(Platform.OS==='web')return <View style={{height:'100%',backgroundColor:color,width:`${value}%`,transition:reduced?'none':'width 220ms cubic-bezier(.22,1,.36,1)'} as never}/>;
 return <Animated.View style={{height:'100%',backgroundColor:color,width:progress.interpolate({inputRange:[0,100],outputRange:['0%','100%']})}}/>;
}
