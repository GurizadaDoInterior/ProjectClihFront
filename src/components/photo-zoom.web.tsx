import {View} from 'react-native';
import {AppText} from './app-text';
import {useTheme} from '@/src/theme/theme-provider';
export function PhotoZoom({value,onChange,disabled}:{value:number;onChange:(value:number)=>void;disabled:boolean}) {
 const {colors}=useTheme();
 return <View style={{flexDirection:'row',alignItems:'center',gap:16,paddingVertical:16}}>
  <AppText style={{color:colors.ink,fontSize:14,fontWeight:'600'}}>Zoom</AppText>
  <input aria-label="Zoom da foto" type="range" min="1" max="3" step="0.01" value={value} disabled={disabled} onChange={e=>onChange(Number(e.currentTarget.value))} style={{flex:1,minWidth:0,accentColor:colors.primary,cursor:'pointer'}}/>
  <AppText style={{color:colors.ink,fontSize:14,fontWeight:'600',minWidth:40,textAlign:'right'}}>{Math.round(value*100)}%</AppText>
 </View>;
}
