import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createArea, createHabit, getAreas } from '@/src/services/api/today-api';
import { isDemo } from '@/src/services/api/client';
import type { DayPeriod, MeasurementType } from '@/src/services/api/contracts';

import { AppScreen } from '@/src/components/app-screen';
import { colors, radius } from '@/src/theme/tokens';

const habitSchema = z.object({
  name: z.string().trim().min(3, 'Digite ao menos 3 caracteres').max(80),
  target: z
    .string()
    .trim()
    .regex(/^\d{1,10}([.,]\d{1,2})?$/, 'Informe um número com até 2 casas decimais')
    .refine((value) => Number(value.replace(',', '.')) > 0, 'A meta deve ser maior que zero'),
  period: z.enum(['Manhã', 'Tarde', 'Noite', 'Sem horário']),
});

type HabitForm = z.infer<typeof habitSchema>;
const periods = ['Manhã', 'Tarde', 'Noite', 'Sem horário'] as const;
const periodValues: Record<string, DayPeriod> = {
  Manhã: 'MORNING',
  Tarde: 'AFTERNOON',
  Noite: 'EVENING',
  'Sem horário': 'ANYTIME',
};
const measurements: { label: string; value: MeasurementType; unit: string }[] = [
  { label: 'Minutos', value: 'MINUTES', unit: 'minutos' },
  { label: 'Páginas', value: 'PAGES', unit: 'páginas' },
  { label: 'Vezes', value: 'COUNT', unit: 'vezes' },
  { label: 'Quilômetros', value: 'DISTANCE_KM', unit: 'km' },
  { label: 'Reais', value: 'MONEY', unit: 'reais' },
  { label: 'Concluir', value: 'BOOLEAN', unit: '' },
];
const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function NewHabitScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const areas = useQuery({ queryKey: ['areas'], queryFn: getAreas });
  const [areaId, setAreaId] = useState('');
  const [newArea, setNewArea] = useState('');
  const [measurement, setMeasurement] = useState(measurements[0]);
  const [days, setDays] = useState(weekDays);
  const [submitError, setSubmitError] = useState('');
  const [creatingArea, setCreatingArea] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: { name: '', target: '1', period: 'Manhã' },
  });

  async function submit(values: HabitForm) {
    setSubmitError('');
    const selectedArea = areaId || areas.data?.[0]?.id;
    if (!selectedArea || !days.length) {
      setSubmitError('Selecione uma área e ao menos um dia.');
      return;
    }
    try {
      await createHabit({
        areaId: selectedArea,
        name: values.name,
        targetValue: measurement.value === 'BOOLEAN' ? 1 : Number(values.target.replace(',', '.')),
        measurementType: measurement.value,
        unit: measurement.unit,
        dayPeriod: periodValues[values.period],
        scheduledDays: days,
      });
      await queryClient.invalidateQueries({ queryKey: ['today'] });
      router.back();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível criar a atividade.',
      );
    }
  }
  async function addArea() {
    if (!newArea.trim() || creatingArea) return;
    setCreatingArea(true);
    setSubmitError('');
    try {
      const area = await createArea(newArea.trim());
      setAreaId(area.id);
      setNewArea('');
      await areas.refetch();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível criar a área.');
    } finally {
      setCreatingArea(false);
    }
  }

  return (
    <AppScreen>
      <Text style={styles.intro}>Comece pequeno. Uma atividade clara é mais fácil de manter.</Text>
      <Text style={styles.label}>Área</Text>
      {areas.isPending ? <Text>Carregando áreas...</Text> : null}
      {areas.isError ? (
        <Pressable onPress={() => areas.refetch()}>
          <Text style={styles.error}>Falha ao carregar áreas. Tentar novamente</Text>
        </Pressable>
      ) : null}
      <View style={styles.periods}>
        {areas.data?.map((area) => (
          <Pressable
            key={area.id}
            onPress={() => setAreaId(area.id)}
            style={[
              styles.period,
              (areaId || areas.data[0]?.id) === area.id && styles.periodSelected,
            ]}
          >
            <Text>{area.name}</Text>
          </Pressable>
        ))}
      </View>
      {!isDemo ? (
        <View style={styles.field}>
          <TextInput
            accessibilityLabel="Nome da nova área"
            editable={!areas.isPending}
            placeholder="Nova área (ex.: Saúde)"
            maxLength={60}
            value={newArea}
            onChangeText={setNewArea}
            style={styles.input}
          />
          <Pressable
            disabled={areas.isPending || creatingArea || !newArea.trim()}
            onPress={addArea}
          >
            <Text style={styles.periodTextSelected}>
              {creatingArea ? 'Criando área...' : 'Adicionar área'}
            </Text>
          </Pressable>
        </View>
      ) : null}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              onChangeText={onChange}
              placeholder="Ex.: Estudar programação"
              placeholderTextColor="#96A3B8"
              value={value}
              style={styles.input}
            />
            {errors.name ? <Text style={styles.error}>{errors.name.message}</Text> : null}
          </View>
        )}
      />
      <Controller
        control={control}
        name="target"
        render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Quantidade da meta</Text>
            <TextInput
              onChangeText={onChange}
              keyboardType="decimal-pad"
              placeholder="Ex.: 30"
              placeholderTextColor="#96A3B8"
              value={value}
              style={styles.input}
            />
            {errors.target ? <Text style={styles.error}>{errors.target.message}</Text> : null}
          </View>
        )}
      />
      <Text style={styles.label}>Unidade</Text>
      <View style={styles.periods}>
        {measurements.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setMeasurement(item)}
            style={[styles.period, measurement.value === item.value && styles.periodSelected]}
          >
            <Text>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Dias da semana</Text>
      <View style={styles.periods}>
        {weekDays.map((day, index) => (
          <Pressable
            key={day}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: days.includes(day) }}
            onPress={() =>
              setDays((current) =>
                current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
              )
            }
            style={[styles.period, days.includes(day) && styles.periodSelected]}
          >
            <Text>{dayLabels[index]}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Período</Text>
      <Controller
        control={control}
        name="period"
        render={({ field: { onChange, value } }) => (
          <View style={styles.periods}>
            {periods.map((period) => (
              <Pressable
                key={period}
                onPress={() => onChange(period)}
                style={[styles.period, value === period && styles.periodSelected]}
              >
                <Text style={[styles.periodText, value === period && styles.periodTextSelected]}>
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      {submitError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {submitError}
        </Text>
      ) : null}
      <Pressable
        disabled={isSubmitting || creatingArea || !areas.data?.length}
        onPress={handleSubmit(submit)}
        style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
      >
        <Text style={styles.submitText}>{isSubmitting ? 'Criando...' : 'Criar atividade'}</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 15, lineHeight: 22, paddingTop: 14, marginBottom: 26 },
  field: { marginBottom: 21 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 9 },
  input: {
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  error: { color: colors.danger, fontSize: 11, marginTop: 5 },
  periods: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  period: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  periodSelected: { borderColor: colors.primary, backgroundColor: colors.blueSoft },
  periodText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  periodTextSelected: { color: colors.primary },
  submit: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  submitText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.82 },
});
