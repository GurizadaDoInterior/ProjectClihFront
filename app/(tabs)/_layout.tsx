import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { colors } from '@/src/theme/tokens';

const icons = {
  index: { ios: 'house.fill', android: 'home', web: 'home' },
  routine: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  progress: { ios: 'chart.bar.fill', android: 'monitoring', web: 'monitoring' },
  achievements: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
  profile: { ios: 'person.fill', android: 'person', web: 'person' },
} as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ color }) => <SymbolView name={icons.index} tintColor={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Rotina',
          tabBarIcon: ({ color }) => <SymbolView name={icons.routine} tintColor={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Evolução',
          tabBarIcon: ({ color }) => <SymbolView name={icons.progress} tintColor={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Conquistas',
          tabBarIcon: ({ color }) => <SymbolView name={icons.achievements} tintColor={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <SymbolView name={icons.profile} tintColor={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
