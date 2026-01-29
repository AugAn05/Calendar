import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { isAdFree } from '../services/adService';

// Only import native ads on mobile platforms
let BannerAd: any = null;
let BannerAdSize: any = null;
let adsAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const GoogleMobileAds = require('react-native-google-mobile-ads');
    BannerAd = GoogleMobileAds.BannerAd;
    BannerAdSize = GoogleMobileAds.BannerAdSize;
    adsAvailable = true;
  } catch (error) {
    console.log('AdMob not available - requires development build');
    adsAvailable = false;
  }
}

const AD_IDS = {
  banner: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111' // Test banner ID
    : Platform.OS === 'ios'
      ? 'ca-app-pub-3169738861869070/8395445747' // iOS Banner
      : 'ca-app-pub-3169738861869070/3969889650', // Android Banner
};

export default function BannerAdComponent() {
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    checkAdFreeStatus();
  }, []);

  const checkAdFreeStatus = async () => {
    const adFree = await isAdFree();
    setShowAd(!adFree);
  };

  // Don't show ads on web or if module not available
  if (Platform.OS === 'web' || !showAd || !adsAvailable || !BannerAd) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_IDS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
