import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useQueryClient } from '@tanstack/react-query';
import { uploadProfilePhoto, removeProfilePhoto } from '@/src/services/api/today-api';
import { useTheme } from '@/src/theme/theme-provider';
import type { User } from '@/src/services/api/contracts';
export function ProfilePhotoEditor({ user }: { user: User }) {
 const { colors } = useTheme();
 const client = useQueryClient();
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 async function change(remove = false) {
  if (busy) return;
  setError(''); setBusy(true);
  try {
   let updated: User;
   if (remove) updated = await removeProfilePhoto();
   else {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled) return;
    const asset = result.assets[0];
    const side = Math.min(asset.width, asset.height);
    const photo = await ImageManipulator.manipulateAsync(asset.uri, [{ crop: { originX: Math.floor((asset.width - side) / 2), originY: Math.floor((asset.height - side) / 2), width: side, height: side } }, { resize: { width: 512, height: 512 } }], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true });
    if (!photo.base64) throw new Error('Não foi possível preparar a imagem.');
    updated = await uploadProfilePhoto('data:image/jpeg;base64,' + photo.base64);
   }
   client.setQueryData(['me'], updated);
  } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível alterar a foto.'); }
  finally { setBusy(false); }
 }
 return <View style={{ marginVertical: 20 }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
   {user.avatarUrl ? <Image accessibilityLabel="Foto do perfil" source={{ uri: user.avatarUrl }} style={{ width: 80, height: 80, borderRadius: 16 }} /> : <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.ink, fontSize: 30 }}>{user.displayName.slice(0,1)}</Text></View>}
   <View><Pressable accessibilityRole="button" disabled={busy} onPress={() => change()} style={{ paddingVertical: 12 }}><Text style={{ color: colors.primary, fontFamily: 'SourceSansBold', fontSize: 16 }}>{busy ? 'Salvando foto...' : user.avatarUrl ? 'Trocar foto' : 'Adicionar foto'}</Text></Pressable>
   {user.avatarUrl ? <Pressable accessibilityRole="button" disabled={busy} onPress={() => change(true)} style={{ paddingVertical: 8 }}><Text style={{ color: colors.muted }}>Remover foto</Text></Pressable> : null}</View>
  </View>
  {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 10 }}>{error}</Text> : null}
 </View>;
}
