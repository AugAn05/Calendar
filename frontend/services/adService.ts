import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds from 'react-native-google-mobile-ads';

const AD_FREE_KEY = '@ad_free_purchased';
const LAST_POPUP_KEY = '@last_ad_popup';

// Initialize Mobile Ads
export async function initializeAds() {
  try {
    await mobileAds().initialize();
    console.log('AdMob initialized');
  } catch (error) {
    console.error('Error initializing AdMob:', error);
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

// AdMob IDs (Test IDs - replace with your real IDs after creating AdMob account)
export const AD_IDS = {
  banner: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111' // Test banner ID
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your real banner ID
  
  rewarded: __DEV__
    ? 'ca-app-pub-3940256099942544/5224354917' // Test rewarded ID
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ', // Your real rewarded ID
};
