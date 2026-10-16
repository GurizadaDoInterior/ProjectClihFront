import { MotionPressable as Pressable } from '@/src/components/motion-pressable';
import { Text, View } from 'react-native';
import { AppScreen } from '@/src/components/app-screen';
import { StreakRocket } from '@/src/components/streak-rocket';
import { flameStages, getFlameStage } from '@/src/features/streak/flame';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { useTheme } from '@/src/theme/theme-provider';

export default function RocketPreviewScreen() {
  const { colors } = useTheme();
  const { data, isError, refetch } = useTodaySummary();
  const current = data ? getFlameStage(data.streakDays) : null;
  const next = data ? flameStages.find(stage => stage.days > data.streakDays) : null;
  return <AppScreen backTo="/">
    <Text accessibilityRole="header" style={{color:colors.ink,fontSize:32,fontWeight:'700',marginTop:18}}>EVOLUÇÃO DO FOGUETE</Text>
    <Text style={{color:colors.muted,fontSize:15,lineHeight:23,marginTop:8,marginBottom:20}}>O corpo mantém o mesmo tamanho em todas as fases. A chama e os efeitos crescem com sua sequência.</Text>
    {data && current ? <View style={{padding:20,borderRadius:12,backgroundColor:colors.surface,borderWidth:2,borderColor:current.color,marginBottom:24,gap:8}}>
      <Text style={{color:current.color,fontSize:12,fontWeight:'700',letterSpacing:1}}>SUA FASE ATUAL</Text>
      <Text style={{color:colors.ink,fontSize:26,fontWeight:'700'}}>{current.name}</Text>
      <Text style={{color:colors.ink,fontSize:16}}>{data.streakDays} {data.streakDays === 1 ? 'dia' : 'dias'} em sequência</Text>
      <Text style={{color:colors.muted,fontSize:14,lineHeight:21}}>{next ? `Faltam ${next.days-data.streakDays} ${next.days-data.streakDays === 1 ? 'dia' : 'dias'} para ${next.name}, aos ${next.days} dias.` : 'Você alcançou a fase lendária. Continue sua sequência para manter o foguete no máximo.'}</Text>
    </View> : isError ? <Pressable onPress={() => refetch()} style={{paddingVertical:16}}><Text style={{color:colors.danger}}>Não foi possível carregar sua fase. Toque para tentar novamente.</Text></Pressable> : <Text style={{color:colors.muted,marginBottom:20}}>Carregando sua fase...</Text>}
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>
      {flameStages.map((stage,index) => {
        const active = current?.days === stage.days;
        return <View key={stage.days} accessibilityLabel={`${stage.name}, ${stage.days} dias${active ? ', sua fase atual' : ''}`} style={{flexGrow:1,flexBasis:180,padding:20,borderWidth:2,borderColor:active ? stage.color : colors.border,borderRadius:12,backgroundColor:colors.surface,alignItems:'center',gap:8}}>
          <View style={{height:24,justifyContent:'center'}}>{active ? <Text style={{color:stage.color,fontSize:11,fontWeight:'700'}}>● FASE ATUAL</Text> : null}</View>
          <View style={{height:120,width:120,alignItems:'center',justifyContent:'center'}}><StreakRocket days={stage.days} size={108} /></View>
          <Text style={{color:stage.color,fontSize:22,fontWeight:'700'}}>{stage.days === 0 ? '0–2 dias' : `${stage.days}${flameStages[index+1] ? `–${flameStages[index+1].days-1}` : '+'} dias`}</Text>
          <Text style={{color:colors.ink,fontSize:15,fontWeight:'600',textAlign:'center'}}>{stage.name}</Text>
          <View style={{height:3,width:40,borderRadius:2,backgroundColor:stage.color,marginTop:4}} />
        </View>;
      })}
    </View>
  </AppScreen>;
}
