import { Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/src/theme/theme-provider';
export type RadarArea = { id: string; name: string; value: number };
export function AreaRadar({ areas }: { areas: RadarArea[] }) {
  const { colors } = useTheme();
  if (!areas.length) return null;
  if (areas.length < 3) return <View accessibilityRole="image" accessibilityLabel={'Desempenho por área: '+areas.map(area=>`${area.name} ${area.value}%`).join(', ')} style={{paddingVertical:24,gap:20}}>
    {areas.map(area=><View key={area.id} style={{gap:10}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',gap:12}}><Text style={{color:colors.ink,fontSize:16,fontWeight:'600'}}>{area.name}</Text><Text style={{color:colors.orange,fontSize:18,fontWeight:'700'}}>{area.value}%</Text></View>
      <View style={{height:12,backgroundColor:colors.surfaceMuted,borderRadius:6,overflow:'hidden'}}><View style={{height:'100%',width:`${Math.max(0,Math.min(100,area.value))}%`,backgroundColor:colors.orange,borderRadius:6}}/></View>
    </View>)}
  </View>;
  const point = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / areas.length;
    return { x: 180 + Math.cos(angle) * 100 * scale, y: 180 + Math.sin(angle) * 100 * scale };
  };
  const points = (scale: number) => areas.map((_, i) => { const p = point(i, scale); return p.x + ',' + p.y; }).join(' ');
  const values = areas.map((area, i) => { const p = point(i, Math.max(0, Math.min(100, area.value)) / 100); return p.x + ',' + p.y; }).join(' ');
  return <View accessible accessibilityRole="image" accessibilityLabel={'Desempenho por área: ' + areas.map(a => a.name + ' ' + a.value + '%').join(', ')} style={{ width: '100%', maxWidth: 440, alignSelf: 'center', aspectRatio: 1 }}>
    <Svg width="100%" height="100%" viewBox="0 0 360 360">
      {[0.25, 0.5, 0.75, 1].map(scale => <Polygon key={scale} points={points(scale)} fill="none" stroke={colors.border} strokeWidth={scale === 1 ? 1.5 : 1} />)}
      {areas.map((area, i) => { const p = point(i, 1); return <Line key={area.id} x1={180} y1={180} x2={p.x} y2={p.y} stroke={colors.border} />; })}
      <Polygon points={values} fill={colors.orange} fillOpacity={0.2} stroke={colors.orange} strokeWidth={2.5} strokeLinejoin="round" />
      {areas.map((area, i) => {
        const dot = point(i, Math.max(0, Math.min(100, area.value)) / 100);
        const label = point(i, 1.36);
        return <ViewlessPoint key={area.id} x={dot.x} y={dot.y} labelX={label.x} labelY={label.y} name={area.name} value={area.value} color={colors.orange} ink={colors.ink} muted={colors.muted} />;
      })}
    </Svg>
  </View>;
}
function ViewlessPoint({ x, y, labelX, labelY, name, value, color, ink, muted }: { x:number; y:number; labelX:number; labelY:number; name:string; value:number; color:string; ink:string; muted:string }) {
  return <G><Circle cx={x} cy={y} r={4} fill={color} /><SvgText fontFamily="SourceSans" x={labelX} y={labelY - 3} textAnchor="middle" fontSize={12} fontWeight="600" fill={muted}>{name.length > 16 ? name.slice(0,15) + '…' : name}</SvgText><SvgText fontFamily="SourceSans" x={labelX} y={labelY + 15} textAnchor="middle" fontSize={16} fontWeight="700" fill={ink}>{value}%</SvgText></G>;
}
