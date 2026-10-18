import {useTheme} from '@/src/theme/theme-provider';
export function PhotoZoom({value,onChange,disabled}:{value:number;onChange:(value:number)=>void;disabled:boolean}) {
 const {colors}=useTheme();
 return <label style={{display:'flex',alignItems:'center',gap:16,color:colors.ink,fontSize:14,fontFamily:'SourceSans',padding:'16px 0'}}>
  <span>Zoom</span><input aria-label="Zoom da foto" type="range" min="1" max="3" step="0.01" value={value} disabled={disabled} onChange={e=>onChange(Number(e.currentTarget.value))} style={{flex:1,minWidth:0,accentColor:colors.primary,cursor:'pointer'}}/><span style={{minWidth:40}}>{Math.round(value*100)}%</span>
 </label>;
}
