import AsyncStorage from '@react-native-async-storage/async-storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { AppScreen } from '@/src/components/app-screen';
import { colors, radius } from '@/src/theme/tokens';

const sleepSchema = z.object({
  sleptAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato 22:30'),
  wokeAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato 07:00'),
  quality: z.enum(['Ruim', 'Regular', 'Boa', 'Ótima']),
});

type SleepForm = z.infer<typeof sleepSchema>;

const qualities = ['Ruim', 'Regular', 'Boa', 'Ótima'] as const;

export default function SleepScreen() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SleepForm>({
    resolver: zodResolver(sleepSchema),
    defaultValues: { sleptAt: '23:00', wokeAt: '07:00', quality: 'Boa' },
  });

  async function submit(values: SleepForm) {
    await AsyncStorage.setItem('@clih/sleep/latest', JSON.stringify({ ...values, recordedAt: new Date().toISOString() }));
    router.back();
  }

  return (
    <AppScreen>
      <Text style={styles.intro}>Este registro fica somente neste aparelho e ainda não é sincronizado com sua conta.</Text>
      <View style={styles.timeRow}>
        <Controller
          control={control}
          name="sleptAt"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Foi dormir</Text>
              <TextInput
                accessibilityLabel="Horário em que foi dormir"
                keyboardType="numbers-and-punctuation"
                onChangeText={onChange}
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
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Acordou</Text>
              <TextInput
                accessibilityLabel="Horário em que acordou"
                keyboardType="numbers-and-punctuation"
                onChangeText={onChange}
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
        render={({ field: { onChange, value } }) => (
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

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 15, lineHeight: 22, paddingTop: 14, marginBottom: 28 },
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 26 },
  field: { flex: 1 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 9 },
  input: { height: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.ink, backgroundColor: colors.surface, fontSize: 18, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 11, marginTop: 5 },
  qualityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quality: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 13, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  qualitySelected: { borderColor: colors.primary, backgroundColor: colors.blueSoft },
  qualityText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  qualityTextSelected: { color: colors.primary },
  submit: { alignItems: 'center', paddingVertical: 16, marginTop: 34, borderRadius: radius.md, backgroundColor: colors.primary },
  submitText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.82 },
});
