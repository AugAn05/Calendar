import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { isAdFree, AD_IDS } from '../services/adService';

export default function BannerAdComponent() {
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    checkAdFreeStatus();
  }, []);

  const checkAdFreeStatus = async () => {
    const adFree = await isAdFree();
    setShowAd(!adFree);
  };

  if (!showAd) {
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
        onAdFailedToLoad={(error) => {
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
