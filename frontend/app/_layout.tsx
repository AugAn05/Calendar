import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../i18n/LanguageContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-course" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-course" options={{ presentation: 'modal' }} />
        <Stack.Screen name="mark-attendance" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bulk-attendance" options={{ presentation: 'modal' }} />
      </Stack>
    </LanguageProvider>
  );
}
