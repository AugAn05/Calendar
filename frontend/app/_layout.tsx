import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { initializeNotifications } from '../services/notificationService';
// Ads disabled for Expo Go - will work in production build
// import { initializeAds } from '../services/adService';

// Support modal disabled for Expo Go - will work in production build
// const SupportCreatorModal = Platform.OS !== 'web' 
//   ? require('../components/SupportCreatorModal').default 
//   : () => null;

function RootLayoutContent() {
  const { language } = useLanguage();

  useEffect(() => {
    // Initialize notifications when app starts
    initializeNotifications(language);
    
    // Initialize ads (disabled for Expo Go)
    // Uncomment this line when building for production:
    // initializeAds();
  }, [language]);

  return (
    <>
      <StatusBar style="light" />
      {/* Support modal disabled for Expo Go */}
      {/* {Platform.OS !== 'web' && <SupportCreatorModal />} */}
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
