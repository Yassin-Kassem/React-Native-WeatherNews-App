import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, LogBox } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component',
]);

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => {
        const isNewsTab = route.name === 'news';

        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: isNewsTab ? '#6d597a' : '#0284c7',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 75,
            paddingTop: 6,
            paddingBottom: 10,
            borderTopColor: '#E2E8F0',
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarItemStyle: {
            borderRadius: 12,
            marginHorizontal: 6,
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            switch (route.name) {
              case 'weather':
                iconName = focused ? 'cloud' : 'cloud-outline';
                break;
              case 'news':
                iconName = focused ? 'newspaper' : 'newspaper-outline';
                break;
              case 'settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'ellipse';
                break;
            }
            return <Ionicons name={iconName} size={22} color={color} />;
          },
        };
      }}
    >
      <Tabs.Screen name="weather" options={{ title: 'Weather' }} />
      <Tabs.Screen name="news" options={{ title: 'News' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="article" options={{ href: null }} />
    </Tabs>
  );
}

