import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { initializeNotifications } from '../services/notificationService';

function RootLayoutContent() {
  const { language } = useLanguage();

  useEffect(() => {
    // Initialize notifications when app starts
    initializeNotifications(language);
  }, [language]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-course" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-course" options={{ presentation: 'modal' }} />
        <Stack.Screen name="mark-attendance" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bulk-attendance" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <RootLayoutContent />
    </LanguageProvider>
  );
}
