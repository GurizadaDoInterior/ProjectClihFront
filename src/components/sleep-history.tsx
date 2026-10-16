import { MotionPressable as Pressable } from '@/src/components/motion-pressable';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { sleepQualityColor } from '@/src/features/sleep/quality-colors';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme-provider';
export type SleepEntry = { date: string; sleptAt: string; wokeAt: string; quality: string; durationMinutes: number };
export const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const duration = (n: number) => `${Math.floor(n/60)}h${String(n%60).padStart(2,'0')}`;
export function SleepHistory({ month, selected, entries, onMonth, onSelect, overview = false, activities, dayDetails }: { activities?: Record<string, { completed: number; planned: number }>; dayDetails?: ReactNode; overview?: boolean; month: Date; selected: string; entries: SleepEntry[]; onMonth: (d: Date) => void; onSelect: (d: string) => void }) {
 const {colors}=useTheme(); const today=dateKey(new Date());
 const monthFade = useRef(new Animated.Value(1)).current;
 const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
 const previousMonth = useRef(monthKey);
 useEffect(() => {
  if(previousMonth.current === monthKey) return;
  previousMonth.current = monthKey;
  monthFade.stopAnimation();
  monthFade.setValue(0.9);
  const animation = Animated.timing(monthFade, {toValue:1,duration:240,easing:Easing.out(Easing.cubic),useNativeDriver:true});
  animation.start();
  return () => animation.stop();
 },[monthKey,monthFade]);
 const offset=(new Date(month.getFullYear(),month.getMonth(),1).getDay()+6)%7;
 const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const entry=entries.find(e=>e.date===selected);
 const week=Array.from({length:7},(_,i)=>{const d=new Date(selected+'T12:00:00');d.setDate(d.getDate()-6+i);return {date:dateKey(d),entry:entries.find(e=>e.date===dateKey(d))};});
 const logged=week.flatMap(d=>d.entry?[d.entry]:[]);
 return <View style={{marginTop:28,gap:16}}>
 <Text style={{color:colors.ink,fontSize:24,fontWeight:'700'}}>{overview ? 'SONO E ATIVIDADES' : 'HISTÓRICO DE SONO'}</Text>
 <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
 <Pressable accessibilityLabel="Mês anterior" onPress={()=>onMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} style={{padding:14}}><Text style={{color:colors.ink,fontSize:26}}>‹</Text></Pressable>
 <Text style={{color:colors.ink,fontWeight:'700'}}>{month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</Text>
 <Pressable accessibilityLabel="Próximo mês" disabled={dateKey(month).slice(0,7)>=today.slice(0,7)} onPress={()=>onMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} style={{padding:14}}><Text style={{color:colors.ink,fontSize:26}}>›</Text></Pressable>
 </View>
 <Animated.View style={{flexDirection:'row',flexWrap:'wrap',opacity:monthFade}}>
 {['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map(d=><Text key={d} style={{width:'14.2857%',textAlign:'center',color:colors.muted,fontSize:10,paddingVertical:8}}>{d}</Text>)}
 {Array.from({length:42},(_,i)=>{
 if(i<offset || i>=offset+count)return <View key={'blank'+i} style={{width:'14.2857%',height:72}}/>;
 const date=dateKey(new Date(month.getFullYear(),month.getMonth(),i-offset+1));const record=entries.find(e=>e.date===date);
 return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${date}, ${record?duration(record.durationMinutes):'sem registro'}`} accessibilityState={{selected:date===selected,disabled:date>today}} disabled={date>today} onPress={()=>onSelect(date)} style={({pressed}) => [{width:'14.2857%',height:72,alignItems:'center',justifyContent:'center',borderRadius:8,borderWidth:1,borderColor:date===selected?colors.ink:'transparent',backgroundColor:record?({Ruim:'#E56A6A',Regular:'#ED9255',Boa:'#EBCB59',Ótima:'#58B77B'}[record.quality] ?? sleepQualityColor(record.quality)):date===selected?colors.blueSoft:colors.surface,opacity:date>today?0.35:pressed?0.8:1}, Platform.OS === 'web' && ({transition:'background-color 240ms ease, border-color 240ms ease, opacity 180ms ease'} as unknown as import('react-native').ViewStyle)]}><Text style={{color:record?(record.quality==='Boa'?'#1C1917':'#FFFFFF'):colors.ink,fontWeight:'700'}}>{i-offset+1}</Text><Text style={{color:record?(record.quality==='Boa'?'#1C1917':'#FFFFFF'):colors.muted,fontSize:10,fontWeight:'600',marginTop:4}}>{record?duration(record.durationMinutes):'·'}</Text>{overview ? <Text style={{fontSize:10,fontWeight:'700',marginTop:3,color:record?(record.quality==='Boa'?'#1C1917':'#FFFFFF'):colors.ink}}>{activities?.[date] ? `✓ ${activities[date].completed}/${activities[date].planned}` : '—'}</Text> : null}</Pressable>;
 })}</Animated.View>
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{['Ruim','Regular','Boa','Ótima'].map(q=><View key={q} style={{flexDirection:'row',alignItems:'center',gap:5}}><View style={{width:8,height:8,borderRadius:4,backgroundColor:sleepQualityColor(q)}}/><Text style={{color:colors.muted,fontSize:12}}>{q}</Text></View>)}</View>
 <Text style={{color:colors.muted}}>{overview ? 'Cores: qualidade do sono. ✓: atividades concluídas / planejadas. Selecione um dia para ver os detalhes.' : 'Toque em um dia para consultar ou editar.'}</Text>
 <View style={{padding:16,borderWidth:1,borderColor:entry?sleepQualityColor(entry.quality):colors.border,borderRadius:8,gap:6}}><Text style={{color:colors.ink,fontWeight:'700'}}>{selected.split('-').reverse().join('/')}</Text><Text style={{color:colors.ink}}>{entry?`${entry.sleptAt} → ${entry.wokeAt} • ${duration(entry.durationMinutes)} • ${entry.quality}`:'Nenhum sono registrado nesse dia.'}</Text></View>
 {dayDetails}
 <Text style={{color:colors.ink,fontSize:22,fontWeight:'700'}}>COMPARAR 7 DIAS</Text>
 <Text style={{color:colors.muted}}>{logged.length?`Média: ${duration(Math.round(logged.reduce((sum,e)=>sum+e.durationMinutes,0)/logged.length))} • ${logged.length} de 7 dias registrados`:'Sem registros nesse período.'}</Text>
 <View style={{flexDirection:'row',gap:8,alignItems:'flex-end',height:150}}>{week.map(d=><View key={d.date} style={{flex:1,alignItems:'center',gap:6}}><Text style={{color:colors.ink,fontSize:10}}>{d.entry?duration(d.entry.durationMinutes):'—'}</Text><View style={{height:d.entry?Math.max(4,d.entry.durationMinutes/1440*110):4,width:'75%',borderRadius:4,backgroundColor:d.entry?sleepQualityColor(d.entry.quality):colors.border}}/><Text style={{color:colors.muted,fontSize:10}}>{d.date.slice(8)}</Text></View>)}</View>
 <Text style={{color:colors.muted,fontSize:12}}>Sete dias até a data selecionada. Dias sem registro não entram na média.</Text>
 </View>;
}
