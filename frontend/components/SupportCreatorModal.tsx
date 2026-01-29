import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shouldShowSupportPopup, markPopupShown, AD_IDS } from '../services/adService';
import { useLanguage } from '../i18n/LanguageContext';

// Only use rewarded ads on native platforms
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let rewarded: any = null;
let adsAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const GoogleMobileAds = require('react-native-google-mobile-ads');
    RewardedAd = GoogleMobileAds.RewardedAd;
    RewardedAdEventType = GoogleMobileAds.RewardedAdEventType;
    rewarded = RewardedAd.createForAdRequest(AD_IDS.rewarded);
    adsAvailable = true;
  } catch (error) {
    console.log('AdMob not available - requires development build');
    adsAvailable = false;
  }
}

export default function SupportCreatorModal() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only check for popup on native platforms
    if (Platform.OS !== 'web') {
      checkAndShowPopup();
      if (rewarded) {
        setupAdListeners();
        loadAd();
      }
    }

    return () => {
      // Cleanup listeners
    };
  }, []);

  const setupAdListeners = () => {
    if (!rewarded || !RewardedAdEventType) return;

    const loadedListener = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setAdLoaded(true);
        setLoading(false);
        console.log('Rewarded ad loaded');
      }
    );

    const earnedListener = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward: any) => {
        console.log('User earned reward:', reward);
        setVisible(false);
        // You could track this or give the user something
      }
    );

    return () => {
      loadedListener();
      earnedListener();
    };
  };

  const loadAd = () => {
    if (rewarded) {
      setLoading(true);
      rewarded.load();
    }
  };

  const checkAndShowPopup = async () => {
    const shouldShow = await shouldShowSupportPopup();
    if (shouldShow) {
      // Wait a bit before showing popup (not immediately on app start)
      setTimeout(() => {
        setVisible(true);
      }, 3000);
    }
  };

  const handleWatchAd = () => {
    if (adLoaded && rewarded) {
      markPopupShown();
      rewarded.show();
    } else if (rewarded) {
      setLoading(true);
      loadAd();
    }
  };

  const handleMaybeLater = () => {
    markPopupShown();
    setVisible(false);
  };

  // Don't render on web
  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleMaybeLater}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={48} color="#FF6B6B" />
          </View>

          <Text style={styles.title}>
            {t('language') === 'ro' ? 'Susține Creatorul' : 'Support the Creator'}
          </Text>

          <Text style={styles.message}>
            {t('language') === 'ro' 
              ? 'Îți place aplicația? Ajută-ne continuând cu un anunț scurt. Mulțumim pentru suport! ❤️'
              : 'Enjoying the app? Help us out by watching a short ad. Thank you for your support! ❤️'}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleWatchAd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="play-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>
                    {t('language') === 'ro' ? 'Vizionează Anunț' : 'Watch Ad'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleMaybeLater}
            >
              <Text style={styles.secondaryButtonText}>
                {t('language') === 'ro' ? 'Poate mai târziu' : 'Maybe Later'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleMaybeLater}
          >
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#2C2C2E',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  buttonIcon: {
    marginRight: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
