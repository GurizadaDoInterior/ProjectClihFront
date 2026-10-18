import type {TextStyle} from 'react-native';
export function textFont(size=14, weight:TextStyle['fontWeight']='400') {
 const value=weight==='bold'?700:Number(weight);
 return size>=20 ? value>=700?'BarlowBold':'Barlow' : value>=700?'SourceSansBold':value>=500?'SourceSansSemiBold':'SourceSans';
}
