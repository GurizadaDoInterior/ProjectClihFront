import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/src/theme/theme-provider';
const names: Record<string, string> = {
 'America/Sao_Paulo': 'Brasília, São Paulo e Rio de Janeiro',
 'America/Manaus': 'Manaus', 'America/Cuiaba': 'Cuiabá', 'America/Rio_Branco': 'Rio Branco',
 'America/Noronha': 'Fernando de Noronha', 'America/Belem': 'Belém', 'America/Fortaleza': 'Fortaleza',
 'America/Recife': 'Recife', 'America/Bahia': 'Salvador', 'America/Porto_Velho': 'Porto Velho',
 'America/Boa_Vista': 'Boa Vista', 'America/Campo_Grande': 'Campo Grande', 'America/Maceio': 'Maceió',
 'America/Santarem': 'Santarém', 'America/Araguaina': 'Araguaína',
 'Europe/Lisbon': 'Lisboa', 'Europe/London': 'Londres', 'America/New_York': 'Nova York',
 'Europe/Paris': 'Paris', 'Asia/Tokyo': 'Tóquio', UTC: 'Tempo universal',
};
const common = ['America/Sao_Paulo','America/Manaus','America/Cuiaba','America/Rio_Branco','America/Noronha','Europe/Lisbon','UTC'];
export function timezoneLabel(zone: string) { return names[zone] ?? zone.split('/').reverse().join(' · ').replaceAll('_', ' '); }
function offset(zone: string) {
 try { return new Intl.DateTimeFormat('pt-BR', { timeZone: zone, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value.replace('GMT','UTC') ?? ''; } catch { return ''; }
}
export function TimezoneSelect({ value, onChange }: { value: string; onChange: (zone: string) => void }) {
 const { colors } = useTheme();
 const [open, setOpen] = useState(false);
 const [search, setSearch] = useState('');
 const zones = useMemo(() => {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
  let available: string[] = [];
  try { available = intl.supportedValuesOf?.('timeZone') ?? []; } catch {}
  return [...new Set([...common, value, Intl.DateTimeFormat().resolvedOptions().timeZone, ...Object.keys(names), ...available])];
 }, [value]);
 const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
 const filtered = zones.filter(zone => normalize(timezoneLabel(zone) + ' ' + zone + ' ' + offset(zone)).includes(normalize(search)));
 function select(zone: string) { onChange(zone); setOpen(false); setSearch(''); }
 const text = { color: colors.ink, fontFamily: 'SourceSans', fontSize: 16 };
 return <View>
  <Pressable accessibilityRole="button" accessibilityLabel="Selecionar fuso horário" onPress={() => setOpen(true)} style={{ padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
   <View style={{ flex: 1 }}><Text style={text}>{timezoneLabel(value)}</Text><Text style={{ ...text, color: colors.muted, fontSize: 13, marginTop: 3 }}>{offset(value)}</Text></View><Text style={text}>⌄</Text>
  </Pressable>
  <Pressable accessibilityRole="button" onPress={() => select(Intl.DateTimeFormat().resolvedOptions().timeZone)} style={{ paddingVertical: 14 }}><Text style={{ ...text, color: colors.primary, fontSize: 14 }}>Usar horário deste aparelho</Text></Pressable>
  <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
   <View style={{ flex: 1, backgroundColor: '#00000080', justifyContent: 'center', padding: 20 }}>
    <View accessibilityViewIsModal style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 20, width: '100%', maxWidth: 520, height: '80%', alignSelf: 'center' }}>
     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><Text style={{ ...text, fontFamily: 'SourceSansBold', fontSize: 21 }}>Escolher fuso horário</Text><Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de fuso" onPress={() => setOpen(false)} style={{ padding: 10 }}><Text style={text}>✕</Text></Pressable></View>
     <TextInput accessibilityLabel="Buscar cidade ou região" placeholder="Buscar cidade ou região" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={{ ...text, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 12 }} />
     <FlatList keyboardShouldPersistTaps="handled" data={filtered} keyExtractor={zone => zone} ListEmptyComponent={<Text style={{ ...text, paddingVertical: 18 }}>Nenhum fuso encontrado.</Text>} renderItem={({item}) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: item === value }} accessibilityLabel={timezoneLabel(item) + ', ' + offset(item)} onPress={() => select(item)} style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1 }}><Text style={text}>{timezoneLabel(item)}</Text><Text style={{ ...text, color: colors.muted, fontSize: 13 }}>{offset(item)}</Text></View><Text style={{ ...text, color: colors.primary }}>{item === value ? '✓' : ''}</Text></Pressable>} />
    </View>
   </View>
  </Modal>
 </View>;
}
