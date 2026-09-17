import React from 'react';
import { Tabs } from 'expo-router';
import { MenuProvider } from '@/components/SideMenu';

export default function TabLayout() {
  return (
    <MenuProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          // The lateral burger menu replaces the bottom tab bar.
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="freight" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="notifications" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </MenuProvider>
  );
}