import { useRef } from 'react';
import { Animated, Easing, Pressable, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/src/theme/theme-provider';
export function BackButton({ fallback = '/' }: { fallback?: Href }) {
 const router=useRouter(); const {colors}=useTheme(); const scale=useRef(new Animated.Value(1)).current;
 const feedback=(value:number)=>Animated.timing(scale,{toValue:value,duration:140,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start();
 return <Animated.View style={{alignSelf:'flex-start',transform:[{scale}],marginBottom:14}}>
  <Pressable accessibilityRole="button" accessibilityLabel="Voltar sem salvar" onPressIn={()=>feedback(0.97)} onPressOut={()=>feedback(1)} onPress={()=>{if(router.canGoBack())router.back();else router.replace(fallback);}} style={{minHeight:44,justifyContent:'center',paddingRight:24}}>
   <Text style={{color:colors.ink,fontSize:16,fontWeight:'700'}}>‹ Voltar</Text>
  </Pressable>
 </Animated.View>;
}
