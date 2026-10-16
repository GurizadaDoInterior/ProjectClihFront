import { useRouter } from 'expo-router';
import { sleepQualityColor } from '@/src/features/sleep/quality-colors';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '@/src/services/api/client';
import { SleepHistory, dateKey, type SleepEntry } from '@/src/components/sleep-history';
import { zodResolver } from '@hookform/resolvers/zod';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { formatTimeInput, normalizeTimeInput } from '@/src/features/sleep/time-input';

import { AppScreen } from '@/src/components/app-screen';
import { radius } from '@/src/theme/tokens';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';

const sleepSchema = z.object({
  sleptAt: z.string().transform(normalizeTimeInput).pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido, como 2230')),
  wokeAt: z.string().transform(normalizeTimeInput).pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido, como 0700')),
  quality: z.enum(['Ruim', 'Regular', 'Boa', 'Ótima']),
});

type SleepForm = z.infer<typeof sleepSchema>;

const qualities = ['Ruim', 'Regular', 'Boa', 'Ótima'] as const;

export default function SleepScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selected, setSelected] = useState(dateKey(new Date()));
  const [month, setMonth] = useState(new Date());
  const [saved, setSaved] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;
  function animateButton(toValue: number) {
    Animated.timing(buttonScale, { toValue, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }
  useEffect(() => () => buttonScale.stopAnimation(), [buttonScale]);
  const from = dateKey(new Date(month.getFullYear(), month.getMonth(), -6));
  const to = dateKey(new Date(month.getFullYear(), month.getMonth()+1, 0));
  const history = useQuery({ queryKey: ['sleep', from, to], placeholderData: keepPreviousData, queryFn: () => request<SleepEntry[]>('/sleep?from='+from+'&to='+to) });
  const [saveError, setSaveError] = useState<string | null>(null);
  const hydratedDate = useRef<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SleepForm>({
    resolver: zodResolver(sleepSchema),
    defaultValues: { sleptAt: '23:00', wokeAt: '07:00', quality: 'Boa' },
  });

  useEffect(() => {
    if (!history.data || history.isPlaceholderData || hydratedDate.current === selected) return;
    hydratedDate.current = selected;
    const entry = history.data.find(item => item.date === selected);
    reset(entry ? { sleptAt: entry.sleptAt, wokeAt: entry.wokeAt, quality: entry.quality as SleepForm['quality'] } : { sleptAt: '23:00', wokeAt: '07:00', quality: 'Boa' });
    setSaved(false);
  }, [selected, history.data, history.isPlaceholderData, reset]);
  useEffect(() => {
    if (isSubmitting || saved) animateButton(1);
  }, [isSubmitting, saved]);
  async function submit(values: SleepForm) {
    if (saved) return;
    animateButton(1);

    setSaveError(null); setSaved(false);
    try {
      const savedEntry = await request<SleepEntry>('/sleep', { method: 'PUT', body: JSON.stringify({ ...values, date: selected }) });
      queryClient.setQueryData<SleepEntry[]>(['sleep', from, to], current => [...(current ?? []).filter(entry => entry.date !== savedEntry.date), savedEntry].sort((a, b) => a.date.localeCompare(b.date)));
      setSaved(true);
      void queryClient.invalidateQueries({ queryKey: ['sleep'] });
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.'); }
  }
  return (
    <AppScreen backTo="/">

      <Text style={styles.intro}>Registre seu descanso e compare suas noites. Os registros ficam salvos na sua conta.</Text>
      {saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}



      <View style={styles.timeRow}>
        <Controller
          control={control}
          name="sleptAt"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Foi dormir</Text>
              <TextInput
                accessibilityLabel="Horário em que foi dormir"
                keyboardType={Platform.OS === "web" ? "default" : "number-pad"}
                inputMode="numeric"
                autoComplete="off"
                placeholderTextColor={colors.muted}
                maxLength={5}
                onChangeText={(text) => { setSaved(false); onChange(formatTimeInput(text, value)); }}
                onBlur={() => { onChange(normalizeTimeInput(value)); onBlur(); }}
                placeholder="23:00"
                value={value}
                style={styles.input}
              />
              {errors.sleptAt ? <Text style={styles.error}>{errors.sleptAt.message}</Text> : null}
            </View>
          )}
        />
        <Controller
          control={control}
          name="wokeAt"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Acordou</Text>
              <TextInput
                accessibilityLabel="Horário em que acordou"
                keyboardType={Platform.OS === "web" ? "default" : "number-pad"}
                inputMode="numeric"
                autoComplete="off"
                placeholderTextColor={colors.muted}
                maxLength={5}
                onChangeText={(text) => { setSaved(false); onChange(formatTimeInput(text, value)); }}
                onBlur={() => { onChange(normalizeTimeInput(value)); onBlur(); }}
                placeholder="07:00"
                value={value}
                style={styles.input}
              />
              {errors.wokeAt ? <Text style={styles.error}>{errors.wokeAt.message}</Text> : null}
            </View>
          )}
        />
      </View>

      <Text style={styles.label}>Qualidade do sono</Text>
      <Controller
        control={control}
        name="quality"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.qualityRow}>
            {qualities.map((quality) => (
              <Pressable
                key={quality}
                accessibilityRole="radio"
                accessibilityState={{ checked: value === quality }}
                onPress={() => { if (value !== quality) { setSaved(false); onChange(quality); } }}
                style={({ pressed }) => [styles.quality, { borderColor: sleepQualityColor(quality), backgroundColor: value === quality ? sleepQualityColor(quality) : colors.surface, opacity: pressed ? 0.85 : 1 }, Platform.OS === 'web' && ({ transition: 'background-color 180ms ease, border-color 180ms ease, opacity 180ms ease' } as unknown as import('react-native').ViewStyle)]}>
                <Text style={[styles.qualityText, { color: value === quality ? (quality === 'Boa' ? '#1C1917' : '#FFFFFF') : colors.ink }]}>{quality}</Text>
              </Pressable>
            ))}
          </View>
        )}
      />

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting || saved}
        accessibilityState={{ disabled: isSubmitting || saved, busy: isSubmitting }}
        onPressIn={() => animateButton(0.98)}
        onPressOut={() => animateButton(1)}
        onPress={handleSubmit(submit)}
        style={[styles.submit, { backgroundColor: saved ? '#15803D' : colors.primary }, Platform.OS === 'web' && ({ transition: 'background-color 300ms ease' } as unknown as import('react-native').ViewStyle)]}>
        <Text accessibilityLiveRegion="polite" style={styles.submitText}>{isSubmitting ? 'Salvando...' : saved ? '✓ Registro salvo' : 'Salvar registro'}</Text>
      </Pressable>
      </Animated.View>
      {history.isPending ? <Text style={styles.intro}>Carregando histórico...</Text> : history.isError ? <Pressable onPress={() => history.refetch()}><Text style={styles.error}>Não foi possível carregar o histórico. Toque para tentar novamente.</Text></Pressable> : <SleepHistory month={month} selected={selected} entries={history.data ?? []} onMonth={date => { setMonth(date); setSelected(dateKey(date)); }} onSelect={setSelected} />}
    </AppScreen>
  );
}

const getStyles = (colors: Palette) => themedStyles({
  intro: { color: colors.muted, fontSize: 15, lineHeight: 22, paddingTop: 14, marginBottom: 28 },
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 26 },
  field: { flex: 1 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 9 },
  input: { height: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.ink, backgroundColor: colors.surface, fontSize: 18, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 11, marginTop: 5 },
  qualityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quality: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface },
  qualitySelected: { borderColor: colors.primary, backgroundColor: colors.blueSoft },
  qualityText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  qualityTextSelected: { color: colors.primary },
  submit: { alignItems: 'center', paddingVertical: 16, marginTop: 34, borderRadius: 8, backgroundColor: colors.primary },
  submitText: { color: colors.onAccent, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.92 },
});
