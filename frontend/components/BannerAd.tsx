import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { isAdFree } from '../services/adService';

// Only import native ads on mobile platforms
let BannerAd: any = null;
let BannerAdSize: any = null;

if (Platform.OS !== 'web') {
  const GoogleMobileAds = require('react-native-google-mobile-ads');
  BannerAd = GoogleMobileAds.BannerAd;
  BannerAdSize = GoogleMobileAds.BannerAdSize;
}

const AD_IDS = {
  banner: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111' // Test banner ID
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your real banner ID
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

  // Don't show ads on web
  if (Platform.OS === 'web' || !showAd || !BannerAd) {
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
