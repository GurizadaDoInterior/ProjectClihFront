import {forwardRef,type ElementRef} from 'react';
import {Text,StyleSheet,type TextProps} from 'react-native';
import {textFont} from '@/src/theme/typography';
export const AppText=forwardRef<ElementRef<typeof Text>,TextProps>(function AppText({style,...props},ref){
 const resolved=StyleSheet.flatten(style) ?? {};
 return <Text {...props} ref={ref} style={{...resolved,fontFamily:resolved.fontFamily ?? textFont(resolved.fontSize,resolved.fontWeight),fontWeight:'normal'}}/>;
});
