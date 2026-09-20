import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { AppScreen } from '@/src/components/app-screen';
import { colors, radius } from '@/src/theme/tokens';

const habitSchema = z.object({
  name: z.string().trim().min(3, 'Digite ao menos 3 caracteres').max(80),
  target: z.string().trim().min(1, 'Informe a meta'),
  period: z.enum(['Manhã', 'Tarde', 'Noite', 'Sem horário']),
});

type HabitForm = z.infer<typeof habitSchema>;
const periods = ['Manhã', 'Tarde', 'Noite', 'Sem horário'] as const;

export default function NewHabitScreen() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: { name: '', target: '', period: 'Manhã' },
  });

  async function submit(_values: HabitForm) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    router.back();
  }

  return (
    <AppScreen>
      <Text style={styles.intro}>Comece pequeno. Uma atividade clara é mais fácil de manter.</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput onChangeText={onChange} placeholder="Ex.: Estudar programação" placeholderTextColor="#96A3B8" value={value} style={styles.input} />
            {errors.name ? <Text style={styles.error}>{errors.name.message}</Text> : null}
          </View>
        )}
      />
      <Controller
        control={control}
        name="target"
        render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Meta</Text>
            <TextInput onChangeText={onChange} placeholder="Ex.: 30 minutos" placeholderTextColor="#96A3B8" value={value} style={styles.input} />
            {errors.target ? <Text style={styles.error}>{errors.target.message}</Text> : null}
          </View>
        )}
      />
      <Text style={styles.label}>Período</Text>
      <Controller
        control={control}
        name="period"
        render={({ field: { onChange, value } }) => (
          <View style={styles.periods}>
            {periods.map((period) => (
              <Pressable key={period} onPress={() => onChange(period)} style={[styles.period, value === period && styles.periodSelected]}>
                <Text style={[styles.periodText, value === period && styles.periodTextSelected]}>{period}</Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      <Pressable disabled={isSubmitting} onPress={handleSubmit(submit)} style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
        <Text style={styles.submitText}>{isSubmitting ? 'Criando...' : 'Criar atividade'}</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 15, lineHeight: 22, paddingTop: 14, marginBottom: 26 },
  field: { marginBottom: 21 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 9 },
  input: { height: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.ink, backgroundColor: colors.surface, fontSize: 15 },
  error: { color: colors.danger, fontSize: 11, marginTop: 5 },
  periods: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  period: { paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  periodSelected: { borderColor: colors.primary, backgroundColor: colors.blueSoft },
  periodText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  periodTextSelected: { color: colors.primary },
  submit: { alignItems: 'center', paddingVertical: 16, marginTop: 34, borderRadius: radius.md, backgroundColor: colors.primary },
  submitText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.82 },
});
