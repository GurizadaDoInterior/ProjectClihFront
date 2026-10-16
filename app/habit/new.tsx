import { MotionPressable as Pressable } from '@/src/components/motion-pressable';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteArea, createArea, createHabit, getTodaySummary, getAreas, resolveHabitArea } from '@/src/services/api/today-api';
import { isDemo } from '@/src/services/api/client';
import type { DayPeriod, MeasurementType } from '@/src/services/api/contracts';

import { AppScreen } from '@/src/components/app-screen';
import { radius } from '@/src/theme/tokens';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';

const habitSchema = z.object({
  name: z.string().trim().min(3, 'Digite ao menos 3 caracteres').max(80),
  dayPeriods: z.array(z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME'])).min(1, 'Selecione ao menos um turno.'),
  target: z
    .string()
    .trim()
    .regex(/^\d{1,10}([.,]\d{1,2})?$/, 'Informe um número com até 2 casas decimais')
    .refine((value) => Number(value.replace(',', '.')) > 0, 'A meta deve ser maior que zero'),

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
  { label: 'Horas', value: 'HOURS', unit: 'horas' },
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
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const queryClient = useQueryClient();
  const areas = useQuery({ queryKey: ['areas'], queryFn: getAreas });
  const [areaId, setAreaId] = useState('');
  const [newArea, setNewArea] = useState('');
  const [measurement, setMeasurement] = useState(measurements[0]);
  const [days, setDays] = useState(weekDays);

  const [submitError, setSubmitError] = useState('');
  const [creatingArea, setCreatingArea] = useState(false);
  const [deletingArea, setDeletingArea] = useState<{ id: string; name: string } | null>(null);
  const areaDeletion = useMutation({
    mutationFn: deleteArea,
    onSuccess: (_result, id) => {
      if (areaId === id) setAreaId('');
      queryClient.setQueryData(['areas'], (current: Awaited<ReturnType<typeof getAreas>> | undefined) => current?.filter(area => area.id !== id));
      setDeletingArea(null);
      void queryClient.invalidateQueries({ queryKey: ['areas'] });
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: { name: '', target: '1', dayPeriods: ['MORNING'] },
  });

  const selectedPeriods = watch('dayPeriods');
  function togglePeriod(period: DayPeriod) {
    const current = watch('dayPeriods');
    const next = period === 'ANYTIME' ? ['ANYTIME' as DayPeriod] : current.includes(period) ? current.filter(item => item !== period) : [...current.filter(item => item !== 'ANYTIME'), period];
    setValue('dayPeriods', next, { shouldValidate: true });
  }
  async function submit(values: HabitForm) {
    setSubmitError('');
    if (!values.dayPeriods.length) { setSubmitError('Selecione ao menos um turno.'); return; }
    if (!days.length) {
      setSubmitError('Selecione ao menos um dia da semana.');
      return;
    }
    try {
      const selectedArea = await resolveHabitArea(areaId, newArea, areas.data ?? []);
      setAreaId(selectedArea);
      setNewArea('');
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
      await createHabit({
        areaId: selectedArea,
        name: values.name,
        targetValue: measurement.value === 'BOOLEAN' ? 1 : Number(values.target.replace(',', '.')),
        measurementType: measurement.value,
        unit: measurement.unit,
        dayPeriod: values.dayPeriods[0],
        dayPeriods: values.dayPeriods,
        scheduledDays: days,
      });
      await queryClient.cancelQueries({ queryKey: ['today'] });
      queryClient.setQueryData(['today'], await getTodaySummary());
      void queryClient.invalidateQueries({ queryKey: ['calendar-activities'] });
      void queryClient.invalidateQueries({ queryKey: ['day-history'] });
      if (router.canGoBack()) router.back(); else router.replace('/routine');
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
    <AppScreen backTo="/routine">
      <Text accessibilityRole="header" style={{color:colors.ink,fontSize:28,fontWeight:'700',marginTop:16}}>Nova atividade</Text><Text style={styles.intro}>Comece pequeno. Uma atividade clara é mais fácil de manter.</Text>
      <Text style={styles.label}>Área</Text>
      {areas.data?.length === 0 ? <Text style={styles.intro}>Você ainda não tem áreas. Digite uma abaixo; ela será criada junto com a atividade.</Text> : null}
      {areas.isPending ? <Text style={styles.intro}>Carregando áreas...</Text> : null}
      {areas.isError ? (
        <Pressable onPress={() => areas.refetch()}>
          <Text style={styles.error}>Falha ao carregar áreas. Tentar novamente</Text>
        </Pressable>
      ) : null}
      <View style={styles.periods}>
        {areas.data?.map((area) => (<View key={area.id}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAreaId(area.id)}
            style={[
              styles.period,
              (areaId || areas.data[0]?.id) === area.id && styles.periodSelected,
            ]}
          >
            <Text style={styles.periodText}>{area.name}</Text>
          </Pressable>
          {!isDemo ? <Pressable accessibilityRole="button" accessibilityLabel={'Excluir área '+area.name} disabled={isSubmitting || creatingArea || areaDeletion.isPending} onPress={() => {areaDeletion.reset();setDeletingArea(area);}} style={{paddingVertical:10,alignItems:'center'}}><Text style={{color:colors.danger,fontSize:12}}>Excluir área</Text></Pressable> : null}
        </View>))}
      </View>
      {!isDemo ? (
        <View style={styles.field}>
          <TextInput
            accessibilityLabel="Nome da nova área"
            editable={!areas.isPending}
            placeholder="Nova área (ex.: Saúde)"
            placeholderTextColor={colors.muted}
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
              placeholderTextColor={colors.muted}
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
              placeholderTextColor={colors.muted}
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
            <Text style={styles.periodText}>{item.label}</Text>
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
            <Text style={styles.periodText}>{dayLabels[index]}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Período</Text>
      <Text style={styles.intro}>Escolha um ou mais turnos. A atividade é concluída uma única vez por dia.</Text>
      <View style={styles.periods}>
        {periods.map(label => {
          const period = periodValues[label];
          const checked = selectedPeriods.includes(period);
          return <Pressable key={period} accessibilityRole="checkbox" accessibilityState={{checked}} onPress={() => togglePeriod(period)} style={[styles.period,checked && styles.periodSelected]}>
            <Text style={[styles.periodText,checked && styles.periodTextSelected]}>{label}</Text>
          </Pressable>;
        })}
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.intro}>Turnos selecionados: {periods.filter(label => selectedPeriods.includes(periodValues[label])).join(' e ') || 'nenhum'}</Text>
      {errors.dayPeriods ? <Text style={styles.error}>{errors.dayPeriods.message}</Text> : null}
      {submitError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {submitError}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting || creatingArea || areas.isPending || areas.isError}
        onPress={handleSubmit(submit, () => setSubmitError('Confira o nome e a quantidade da meta antes de criar a atividade.'))}
        style={({ pressed }) => [styles.submit, { opacity: isSubmitting || creatingArea || areas.isPending || areas.isError ? 0.55 : pressed ? 0.9 : 1 }]}
      >
        <Text style={styles.submitText}>{isSubmitting ? 'Criando...' : 'Criar atividade'}</Text>
      </Pressable>
      <Modal visible={deletingArea !== null} transparent animationType="fade" onRequestClose={() => {if(!areaDeletion.isPending)setDeletingArea(null);}}>
        <View style={{flex:1,backgroundColor:'#00000080',alignItems:'center',justifyContent:'center',padding:24}}>
          <View accessibilityViewIsModal style={{width:'100%',maxWidth:420,padding:24,borderRadius:16,backgroundColor:colors.surface,gap:16}}>
            <Text style={{color:colors.ink,fontSize:23,fontWeight:'700'}}>Excluir área?</Text>
            <Text style={{color:colors.muted,lineHeight:22}}>Excluir “{deletingArea?.name}”? Áreas com atividades vinculadas só podem ser excluídas depois de remover ou mover suas atividades.</Text>
            {areaDeletion.error ? <Text accessibilityRole="alert" style={{color:colors.danger}}>{areaDeletion.error.message}</Text> : null}
            <View style={{flexDirection:'row',gap:12}}>
              <Pressable disabled={areaDeletion.isPending} onPress={() => setDeletingArea(null)} style={{flex:1,padding:14,alignItems:'center',borderWidth:1,borderColor:colors.border,borderRadius:8}}><Text style={{color:colors.ink,fontWeight:'700'}}>Cancelar</Text></Pressable>
              <Pressable disabled={areaDeletion.isPending} onPress={() => {if(deletingArea)areaDeletion.mutate(deletingArea.id);}} style={{flex:1,padding:14,alignItems:'center',backgroundColor:'#BC3831',borderRadius:8}}><Text style={{color:'#FFFFFF',fontWeight:'700'}}>{areaDeletion.isPending?'Excluindo...':'Excluir'}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const getStyles = (colors: Palette) => themedStyles({
  intro: { color: colors.muted, fontSize: 15, lineHeight: 22, paddingTop: 14, marginBottom: 26 },
  field: { marginBottom: 21 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 9 },
  input: {
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  error: { color: colors.danger, fontSize: 11, marginTop: 5 },
  periods: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 20 },
  period: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  periodSelected: { borderColor: colors.primary, backgroundColor: colors.blueSoft },
  periodText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  periodTextSelected: { color: colors.primary },
  submit: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 34,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  submitText: { color: colors.onAccent, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.82 },
});
