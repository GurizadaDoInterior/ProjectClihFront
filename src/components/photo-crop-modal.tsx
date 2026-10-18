import {AppText as Text} from '@/src/components/app-text';
import {useEffect,useRef,useState} from 'react';
import {Animated,Image,Modal,PanResponder,Platform,View,useWindowDimensions} from 'react-native';
import {MotionPressable as Pressable} from './motion-pressable';
import {PhotoZoom} from './photo-zoom';
import {constrainPhoto,photoCrop,type CropImage} from './photo-crop';
import {useTheme} from '@/src/theme/theme-provider';

type Props={image:CropImage;busy:boolean;error:string;onCancel:()=>void;onConfirm:(crop:ReturnType<typeof photoCrop>)=>void};
export function PhotoCropModal({image,busy,error,onCancel,onConfirm}:Props) {
 const {colors}=useTheme();
 const window=useWindowDimensions();
 const size=Math.max(120,Math.min(300,window.width-96,window.height-330));
 const [zoom,setZoom]=useState(1);
 const offset=useRef(new Animated.ValueXY()).current;
 const position=useRef({x:0,y:0,zoom:1});
 const drag=useRef({x:0,y:0,distance:0,zoom:1,pinching:false});
 const current=useRef({image,size,busy});current.current={image,size,busy};
 function move(x:number,y:number,z=position.current.zoom) {
  const c=current.current;const next=constrainPhoto(c.image,c.size,z,x,y);
  position.current={x:next.x,y:next.y,zoom:z};offset.setValue({x:next.x,y:next.y});
 }
 function zoomTo(value:number) {
  const old=position.current;const next=Math.max(1,Math.min(3,value));
  move(old.x*next/old.zoom,old.y*next/old.zoom,next);setZoom(next);
 }
 useEffect(()=>{position.current={x:0,y:0,zoom:1};offset.setValue({x:0,y:0});setZoom(1);},[image.uri,size,offset]);
 const responder=useRef(PanResponder.create({
  onStartShouldSetPanResponder:()=>!current.current.busy,
  onMoveShouldSetPanResponder:()=>!current.current.busy,
  onPanResponderGrant:e=>{
   const p=position.current;const t=e.nativeEvent.touches;
   drag.current={x:p.x,y:p.y,zoom:p.zoom,distance:t.length>1?Math.hypot(t[0].pageX-t[1].pageX,t[0].pageY-t[1].pageY):0,pinching:t.length>1};
  },
  onPanResponderMove:(e,g)=>{
   if(current.current.busy)return;
   const touches=e.nativeEvent.touches;const start=drag.current;
   if(touches.length>1){
    const distance=Math.hypot(touches[0].pageX-touches[1].pageX,touches[0].pageY-touches[1].pageY);
    if(!start.pinching){start.pinching=true;start.distance=distance;start.zoom=position.current.zoom;}
    zoomTo(start.distance?start.zoom*distance/start.distance:position.current.zoom);
   }else{
    if(start.pinching){start.pinching=false;start.x=position.current.x-g.dx;start.y=position.current.y-g.dy;}
    move(start.x+g.dx,start.y+g.dy);
   }
  },
  onPanResponderTerminationRequest:()=>false,
 })).current;
 const frame=constrainPhoto(image,size,zoom,0,0);
 return <Modal visible transparent animationType="fade" onRequestClose={()=>{if(!busy)onCancel();}}>
  <View style={{flex:1,backgroundColor:'#00000099',justifyContent:'center',alignItems:'center',padding:24}}>
   <View accessibilityViewIsModal style={{width:'100%',maxWidth:396,maxHeight:'100%',padding:24,borderRadius:18,backgroundColor:colors.surface,gap:12}}>
    <Text accessibilityRole="header" style={{color:colors.ink,fontSize:25,fontWeight:'700'}}>Ajustar foto</Text>
    <Text style={{color:colors.muted,lineHeight:21}}>Arraste para enquadrar e ajuste o zoom antes de confirmar.</Text>
    <View {...responder.panHandlers} style={[{width:size,height:size,alignSelf:'center',overflow:'hidden',borderRadius:16,backgroundColor:colors.surfaceMuted},Platform.OS==='web'?{touchAction:'none',cursor:busy?'wait':'grab',userSelect:'none'} as never:null]}>
     <Animated.Image accessible={false} source={{uri:image.uri}} resizeMode="stretch" style={{position:'absolute',width:frame.width,height:frame.height,left:(size-frame.width)/2,top:(size-frame.height)/2,transform:offset.getTranslateTransform()}} />
     <View pointerEvents="none" style={{position:'absolute',inset:0,borderWidth:1,borderColor:colors.border,borderRadius:16}} />
    </View>
    <PhotoZoom value={zoom} onChange={zoomTo} disabled={busy}/>
    {error?<Text accessibilityRole="alert" style={{color:colors.danger}}>{error}</Text>:null}
    <View style={{flexDirection:'row',gap:12}}>
     <Pressable disabled={busy} onPress={onCancel} style={{flex:1,paddingVertical:14,alignItems:'center',borderRadius:8,borderWidth:1,borderColor:colors.border}}><Text style={{color:colors.ink,fontWeight:'600'}}>Cancelar</Text></Pressable>
     <Pressable disabled={busy} onPress={()=>{const p=position.current;onConfirm(photoCrop(image,size,p.zoom,p.x,p.y));}} style={{flex:1,paddingVertical:14,alignItems:'center',borderRadius:8,backgroundColor:colors.primary,opacity:busy?.6:1}}><Text style={{color:colors.onAccent,fontWeight:'700'}}>{busy?'Salvando...':'Usar foto'}</Text></Pressable>
    </View>
   </View>
  </View>
 </Modal>;
}
