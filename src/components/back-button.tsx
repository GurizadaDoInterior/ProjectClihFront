import { Text } from 'react-native';
import { MotionPressable } from './motion-pressable';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/src/theme/theme-provider';
export function BackButton({ fallback = '/' }: { fallback?: Href }) {
  const router=useRouter(); const {colors}=useTheme();
  return <MotionPressable accessibilityRole="button" accessibilityLabel="Voltar sem salvar" onPress={()=>{if(router.canGoBack())router.back();else router.replace(fallback);}} style={{alignSelf:'flex-start',marginBottom:14,minHeight:44,justifyContent:'center',paddingRight:24}}>
    <Text style={{color:colors.ink,fontSize:16,fontWeight:'700'}}>‹ Voltar</Text>
  </MotionPressable>;
}
