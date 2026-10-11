import AsyncStorage from '@react-native-async-storage/async-storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SleepForm>({
    resolver: zodResolver(sleepSchema),
    defaultValues: { sleptAt: '23:00', wokeAt: '07:00', quality: 'Boa' },
  });

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('@clih/sleep/latest').then((saved) => {
      if (!saved || !active) return;
      const parsed = sleepSchema.safeParse(JSON.parse(saved));
      if (parsed.success) reset(parsed.data);
    }).catch(() => { if (active) setSaveError('Não foi possível carregar o último registro.'); });
    return () => { active = false; };
  }, [reset]);

  async function submit(values: SleepForm) {
    setSaveError(null);
    try {
      await AsyncStorage.setItem('@clih/sleep/latest', JSON.stringify({ ...values, recordedAt: new Date().toISOString() }));
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch {
      setSaveError('Não foi possível salvar. Tente novamente.');
    }
  }

  return (
    <AppScreen>
      <Text style={styles.intro}>Este registro fica somente neste aparelho e ainda não é sincronizado com sua conta.</Text>
      {saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}
      <Text style={styles.label}>Digite só os números. Ex.: 2230 vira 22:30.</Text>
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
                onChangeText={(text) => onChange(formatTimeInput(text, value))}
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
                onChangeText={(text) => onChange(formatTimeInput(text, value))}
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
                onPress={() => onChange(quality)}
                style={[styles.quality, value === quality && styles.qualitySelected]}>
                <Text style={[styles.qualityText, value === quality && styles.qualityTextSelected]}>{quality}</Text>
              </Pressable>
            ))}
          </View>
        )}
      />

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={handleSubmit(submit)}
        style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
        <Text style={styles.submitText}>{isSubmitting ? 'Salvando...' : 'Salvar registro'}</Text>
      </Pressable>
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
  pressed: { opacity: 0.82 },
});
