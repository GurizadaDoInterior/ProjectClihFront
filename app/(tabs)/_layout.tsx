import type { Ref } from 'react';
import type { View } from 'react-native';
import { MotionPressable } from '@/src/components/motion-pressable';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';

const icons = {
  index: { ios: 'house.fill', android: 'home', web: 'home' },
  routine: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  progress: { ios: 'chart.bar.fill', android: 'monitoring', web: 'monitoring' },
  achievements: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
  profile: { ios: 'person.fill', android: 'person', web: 'person' },
} as const;

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        lazy: false,
        freezeOnBlur: false,
        animation: 'none',
        tabBarButton: ({ref, ...props}) => <MotionPressable {...props} ref={ref as Ref<View>} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: { fontSize: 11, lineHeight: 16, height: 18, flexShrink: 0, fontFamily: 'SourceSansBold', marginTop: 4 },
        tabBarIconStyle: { width: 32, height: 30 },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarStyle: {
          height: 84 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ color }) => <SymbolView name={icons.index} tintColor={color} size={22} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Rotina',
          tabBarIcon: ({ color }) => <SymbolView name={icons.routine} tintColor={color} size={22} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Evolução',
          tabBarIcon: ({ color }) => <SymbolView name={icons.progress} tintColor={color} size={22} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Conquistas',
          tabBarIcon: ({ color }) => <SymbolView name={icons.achievements} tintColor={color} size={22} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <SymbolView name={icons.profile} tintColor={color} size={22} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }} />,
        }}
      />
    </Tabs>
  );
}
