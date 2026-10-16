import { Text, View } from 'react-native';
import { AppScreen } from '@/src/components/app-screen';
import { StreakRocket } from '@/src/components/streak-rocket';
import { flameStages } from '@/src/features/streak/flame';
import { useTheme } from '@/src/theme/theme-provider';

export default function RocketPreviewScreen() {
  const { colors } = useTheme();
  return <AppScreen backTo="/">
    <Text accessibilityRole="header" style={{color:colors.ink,fontSize:32,fontWeight:'700',marginTop:18}}>EVOLUÇÃO DO FOGUETE</Text>
    <Text style={{color:colors.muted,fontSize:15,lineHeight:23,marginTop:8,marginBottom:24}}>A cor e a intensidade da chama acompanham sua sequência de dias. Estes são os mesmos foguetes usados na tela inicial.</Text>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>
      {flameStages.map((stage,index) => <View key={stage.days} style={{flexGrow:1,flexBasis:180,padding:20,borderWidth:1,borderColor:colors.border,borderRadius:12,backgroundColor:colors.surface,alignItems:'center',gap:8}}>
        <StreakRocket days={stage.days} size={108} />
        <Text style={{color:stage.color,fontSize:22,fontWeight:'700'}}>{stage.days === 0 ? '0–2 dias' : `${stage.days}${flameStages[index+1] ? `–${flameStages[index+1].days-1}` : '+'} dias`}</Text>
        <Text style={{color:colors.ink,fontSize:15,fontWeight:'600',textAlign:'center'}}>{stage.name}</Text>
        <View style={{height:3,width:40,borderRadius:2,backgroundColor:stage.color,marginTop:4}} />
      </View>)}
    </View>
  </AppScreen>;
}
