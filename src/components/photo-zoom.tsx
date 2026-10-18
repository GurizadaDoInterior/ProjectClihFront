import {AppText as Text} from '@/src/components/app-text';
import {View} from 'react-native';
import {MotionPressable as Pressable} from './motion-pressable';
import {useTheme} from '@/src/theme/theme-provider';
export function PhotoZoom({value,onChange,disabled}:{value:number;onChange:(value:number)=>void;disabled:boolean}) {
 const {colors}=useTheme();
 return <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:20}} accessibilityRole="adjustable" accessibilityLabel="Zoom da foto" accessibilityValue={{min:100,max:300,now:Math.round(value*100)}} accessibilityActions={[{name:'increment'},{name:'decrement'}]} onAccessibilityAction={e=>{if(!disabled)onChange(Math.max(1,Math.min(3,value+(e.nativeEvent.actionName==='increment'?.1:-.1))));}}>
  <Pressable accessibilityRole="button" accessibilityLabel="Diminuir zoom" disabled={disabled || value<=1} onPress={()=>onChange(Math.max(1,value-.1))} style={{padding:14}}><Text style={{color:colors.ink,fontSize:26}}>−</Text></Pressable>
  <Text style={{color:colors.ink}}>Zoom {Math.round(value*100)}%</Text>
  <Pressable accessibilityRole="button" accessibilityLabel="Aumentar zoom" disabled={disabled || value>=3} onPress={()=>onChange(Math.min(3,value+.1))} style={{padding:14}}><Text style={{color:colors.ink,fontSize:26}}>+</Text></Pressable>
 </View>;
}
