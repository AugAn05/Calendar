import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AD_FREE_KEY = '@ad_free_purchased';
const LAST_POPUP_KEY = '@last_ad_popup';

// Initialize Mobile Ads (only works with development build, not Expo Go)
export async function initializeAds() {
  if (Platform.OS === 'web') {
    console.log('Ads not supported on web');
    return;
  }
  
  try {
    const GoogleMobileAds = require('react-native-google-mobile-ads');
    if (GoogleMobileAds && GoogleMobileAds.default) {
      await GoogleMobileAds.default().initialize();
      console.log('AdMob initialized successfully');
    } else {
      console.log('AdMob not available - requires development build');
    }
  } catch (error) {
    console.log('AdMob not available in Expo Go - this is normal. Ads will work after building the app.');
  }
}

// Check if user has purchased ad-free version
export async function isAdFree(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(AD_FREE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking ad-free status:', error);
    return false;
  }
}

// Set ad-free status
export async function setAdFree(status: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(AD_FREE_KEY, status.toString());
    console.log('Ad-free status set to:', status);
  } catch (error) {
    console.error('Error setting ad-free status:', error);
  }
}

// Check if we should show the support popup
export async function shouldShowSupportPopup(): Promise<boolean> {
  try {
    // Don't show if user is ad-free
    const adFree = await isAdFree();
    if (adFree) return false;

    const lastPopupStr = await AsyncStorage.getItem(LAST_POPUP_KEY);
    
    if (!lastPopupStr) {
      // First time - show popup
      return true;
    }

    const lastPopup = parseInt(lastPopupStr);
    const now = Date.now();
    const hoursSinceLastPopup = (now - lastPopup) / (1000 * 60 * 60);

    // Show popup every 24 hours
    return hoursSinceLastPopup >= 24;
  } catch (error) {
    console.error('Error checking popup status:', error);
    return false;
  }
}

// Mark that we showed the popup
export async function markPopupShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_POPUP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error marking popup shown:', error);
  }
}

// AdMob IDs
export const AD_IDS = {
  banner: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111' // Test banner ID
    : Platform.OS === 'ios'
      ? 'ca-app-pub-3169738861869070/8395445747' // iOS Banner
      : 'ca-app-pub-3169738861869070/3969889650', // Android Banner
  
  rewarded: __DEV__
    ? 'ca-app-pub-3940256099942544/5224354917' // Test rewarded ID
    : Platform.OS === 'ios'
      ? 'ca-app-pub-3169738861869070/9145420631' // iOS Rewarded
      : 'ca-app-pub-3169738861869070/2058042186', // Android Rewarded
};
