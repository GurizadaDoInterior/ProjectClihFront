import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen } from '@/src/components/app-screen';
import { getMe, updateMe } from '@/src/services/api/today-api';
import type { User } from '@/src/services/api/contracts';
import { colors, radius } from '@/src/theme/tokens';

export default function EditProfileScreen() {
  const profile = useQuery({ queryKey: ['me'], queryFn: getMe });
  if (!profile.data)
    return (
      <AppScreen>
        <Pressable onPress={() => profile.refetch()}>
          <Text>
            {profile.error
              ? `${profile.error.message} Toque para tentar novamente.`
              : 'Carregando perfil...'}
          </Text>
        </Pressable>
      </AppScreen>
    );
  return <ProfileForm user={profile.data} />;
}

function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username ?? '');
  const [timezone, setTimezone] = useState(user.timezoneId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    if (saving) return;
    const handle = username.trim().toLowerCase();
    if (
      name.trim().length < 2 ||
      name.trim().length > 80 ||
      (handle && !/^[a-z0-9._]{3,30}$/.test(handle))
    ) {
      setError(
        'Use um nome com 2 a 80 caracteres e um usuário com 3 a 30 letras, números, pontos ou sublinhados.',
      );
      return;
    }
    try {
      new Intl.DateTimeFormat('pt-BR', { timeZone: timezone.trim() });
    } catch {
      setError('Informe um fuso válido, como America/Sao_Paulo.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateMe({
        displayName: name.trim(),
        username: handle || undefined,
        timezoneId: timezone.trim(),
        completeOnboarding: true,
      });
      queryClient.setQueryData(['me'], updated);
      await queryClient.invalidateQueries({ queryKey: ['today'] });
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <AppScreen>
      <Text style={styles.note}>
        Seu fuso define o dia usado na rotina e na sequência de atividades.
      </Text>
      <Text style={styles.label}>Nome</Text>
      <TextInput
        accessibilityLabel="Nome do perfil"
        style={styles.input}
        value={name}
        onChangeText={setName}
        maxLength={80}
      />
      <Text style={styles.label}>Usuário (opcional)</Text>
      <TextInput
        accessibilityLabel="Nome de usuário"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        maxLength={30}
      />
      <Text style={styles.label}>Fuso horário</Text>
      <TextInput
        accessibilityLabel="Fuso horário"
        style={styles.input}
        value={timezone}
        onChangeText={setTimezone}
        autoCapitalize="none"
      />
      <Pressable onPress={() => setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)}>
        <Text style={styles.link}>Usar fuso deste aparelho</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={styles.button}>
        <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Salvar perfil'}</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, marginVertical: 20, lineHeight: 22 },
  label: { color: colors.ink, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    color: colors.ink,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: 20,
  },
  link: { color: colors.primary, paddingVertical: 10 },
  error: { color: colors.danger, marginTop: 16 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    padding: 16,
    marginTop: 24,
  },
  buttonText: { color: colors.surface, fontWeight: '800' },
});
