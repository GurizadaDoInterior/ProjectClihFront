import {AppText as Text} from '@/src/components/app-text';
import {MotionPressable as Pressable} from '@/src/components/motion-pressable';
import {useRef,useState} from 'react';
import {Image,View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {useQueryClient} from '@tanstack/react-query';
import {uploadProfilePhoto,removeProfilePhoto} from '@/src/services/api/today-api';
import {PhotoCropModal} from './photo-crop-modal';
import {type CropImage,photoCrop} from './photo-crop';
import {useTheme} from '@/src/theme/theme-provider';
import type {User} from '@/src/services/api/contracts';

export function ProfilePhotoEditor({user}:{user:User}) {
 const {colors}=useTheme();const client=useQueryClient();
 const [busy,setBusy]=useState(false);const locked=useRef(false);
 const [error,setError]=useState('');const [image,setImage]=useState<CropImage|null>(null);
 async function choose(remove=false) {
  if(locked.current)return;locked.current=true;setError('');setBusy(true);
  try{
   if(remove){client.setQueryData(['me'],await removeProfilePhoto());return;}
   const selected=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:false,quality:1});
   if(selected.canceled)return;
   const asset=selected.assets[0];
   const resize=Math.max(asset.width,asset.height)>1600?[{resize:asset.width>=asset.height?{width:1600}:{height:1600}}]:[];
   const prepared=await ImageManipulator.manipulateAsync(asset.uri,resize,{compress:.95,format:ImageManipulator.SaveFormat.JPEG});
   setImage({uri:prepared.uri,width:prepared.width,height:prepared.height});
  }catch(cause){setError(cause instanceof Error?cause.message:'Não foi possível preparar a foto.');}
  finally{locked.current=false;setBusy(false);}
 }
 async function confirm(crop:ReturnType<typeof photoCrop>) {
  if(!image || locked.current)return;locked.current=true;setBusy(true);setError('');
  try{
   const photo=await ImageManipulator.manipulateAsync(image.uri,[{crop},{resize:{width:512,height:512}}],{compress:.8,format:ImageManipulator.SaveFormat.JPEG,base64:true});
   if(!photo.base64)throw new Error('Não foi possível preparar a imagem.');
   const updated=await uploadProfilePhoto('data:image/jpeg;base64,'+photo.base64);
   client.setQueryData(['me'],updated);setImage(null);
  }catch(cause){setError(cause instanceof Error?cause.message:'Não foi possível salvar a foto.');}
  finally{locked.current=false;setBusy(false);}
 }
 return <View style={{marginVertical:20}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:16}}>
   {user.avatarUrl?<Image accessibilityLabel="Foto do perfil" source={{uri:user.avatarUrl}} style={{width:80,height:80,borderRadius:16}}/>:<View style={{width:80,height:80,borderRadius:16,backgroundColor:colors.surfaceMuted,alignItems:'center',justifyContent:'center'}}><Text style={{color:colors.ink,fontSize:30}}>{user.displayName.slice(0,1)}</Text></View>}
   <View><Pressable accessibilityRole="button" disabled={busy || !!image} onPress={()=>choose()} style={{paddingVertical:12}}><Text style={{color:colors.primary,fontSize:16,fontWeight:'700'}}>{busy?'Preparando foto...':user.avatarUrl?'Trocar foto':'Adicionar foto'}</Text></Pressable>
    {user.avatarUrl?<Pressable accessibilityRole="button" disabled={busy || !!image} onPress={()=>choose(true)} style={{paddingVertical:8}}><Text style={{color:colors.muted}}>Remover foto</Text></Pressable>:null}
   </View>
  </View>
  {error && !image?<Text accessibilityRole="alert" style={{color:colors.danger,marginTop:10}}>{error}</Text>:null}
  {image?<PhotoCropModal image={image} busy={busy} error={error} onCancel={()=>{setImage(null);setError('');}} onConfirm={confirm}/>:null}
 </View>;
}
