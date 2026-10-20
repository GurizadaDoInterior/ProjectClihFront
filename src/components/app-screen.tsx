import { PropsWithChildren, useCallback, useRef } from 'react';
import { useFocusEffect, type Href } from 'expo-router';
import { BackButton } from './back-button';
import { Animated, Easing, Platform, ScrollView, View, Text } from 'react-native';
import { useReducedMotion } from './use-reduced-motion';
import { motion } from '../theme/motion';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from './theme-toggle';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
type AppScreenProps = PropsWithChildren<{ scroll?: boolean; testID?: string; backTo?: Href }>;
export function AppScreen({ children, scroll = true, testID, backTo }: AppScreenProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const screen = useRef<View>(null);
  const reveal = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReducedMotion();
  useFocusEffect(useCallback(()=>{
    if(Platform.OS === 'web') {
      const element=screen.current as unknown as HTMLElement | null;
      if(reduceMotion || typeof element?.animate !== 'function')return;
      const animation=element.animate([{opacity:0.94},{opacity:1}],{duration:motion.duration.transition,easing:motion.easing});
      return ()=>animation.cancel();
    }
    reveal.stopAnimation();
    if(reduceMotion){reveal.setValue(1);return;}
    reveal.setValue(0);
    const animation=Animated.timing(reveal,{toValue:1,duration:motion.duration.transition,easing:Easing.bezier(...motion.curve),useNativeDriver:true,isInteraction:false});
    animation.start();
    return ()=>animation.stop();
  },[reduceMotion,reveal]));
  const masthead = <View style={styles.masthead}>
    <View style={styles.brandRow}><View style={styles.brandStripe} /><Text style={styles.brand}>CLIH</Text><Text style={styles.brandLabel}>ROTINA PESSOAL</Text></View>
    <ThemeToggle />
  </View>;
  return <SafeAreaView edges={['top']} style={styles.safe} testID={testID}>
    <Animated.View ref={screen} style={Platform.OS === 'web' ? {flex:1} : {flex:1,opacity:reveal.interpolate({inputRange:[0,1],outputRange:[0.94,1]}),transform:[{translateY:reveal.interpolate({inputRange:[0,1],outputRange:[3,0]})}]}}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{masthead}{backTo ? <BackButton fallback={backTo}/> : null}{children}</ScrollView>
      : <View style={[styles.content, { flex: 1 }]}>{masthead}{backTo ? <BackButton fallback={backTo}/> : null}{children}</View>}
    </Animated.View>
  </SafeAreaView>;
}
const getStyles = (colors: Palette) => themedStyles({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 920, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 36 },
  masthead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 14, marginBottom: 22, borderBottomWidth: 2, borderBottomColor: colors.ink },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandStripe: { width: 5, height: 24, backgroundColor: colors.orange, transform: [{ skewX: '-12deg' }] },
  brand: { color: colors.ink, fontSize: 29, fontWeight: '700', letterSpacing: 1 },
  brandLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
});
