import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/translations';
import { isAdFree, setAdFree } from '../../services/adService';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const [adFreeStatus, setAdFreeStatus] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    checkAdFreeStatus();
  }, []);

  const checkAdFreeStatus = async () => {
    const status = await isAdFree();
    setAdFreeStatus(status);
  };

  const handlePurchase = async () => {
    Alert.alert(
      t('confirm'),
      language === 'ro'
        ? 'Dorești să cumperi versiunea fără reclame pentru $2.99?'
        : 'Do you want to purchase the ad-free version for $2.99?',
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('confirm'),
          onPress: async () => {
            setPurchasing(true);
            // Simulate purchase (in production, this would call in-app purchase API)
            setTimeout(async () => {
              await setAdFree(true);
              setAdFreeStatus(true);
              setPurchasing(false);
              Alert.alert(t('success'), t('purchaseSuccess') + ' ' + t('thankYou'));
            }, 1500);
          },
        },
      ]
    );
  };

  const handleRestorePurchase = async () => {
    // In production, this would check with the app store
    const status = await isAdFree();
    if (status) {
      Alert.alert(t('success'), t('alreadyAdFree'));
    } else {
      Alert.alert(
        t('error'),
        language === 'ro'
          ? 'Nu am găsit achiziții anterioare.'
          : 'No previous purchases found.'
      );
    }
  };

  const languages: Array<{ code: Language; name: string; flag: string }> = [
    { code: 'en', name: t('english'), flag: '🇬🇧' },
    { code: 'ro', name: t('romanian'), flag: '🇷🇴' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('appSettings')}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Ad-Free Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('removeAds')}</Text>
          {adFreeStatus ? (
            <View style={styles.adFreeCard}>
              <View style={styles.adFreeContent}>
                <Ionicons name="checkmark-circle" size={48} color="#50C878" />
                <View style={styles.adFreeTextContainer}>
                  <Text style={styles.adFreeTitle}>{t('alreadyAdFree')}</Text>
                  <Text style={styles.adFreeDesc}>{t('thankYou')}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.purchaseCard}>
              <View style={styles.purchaseHeader}>
                <Ionicons name="sparkles" size={32} color="#FFB347" />
                <Text style={styles.purchaseTitle}>{t('adFree')}</Text>
              </View>
              <Text style={styles.purchaseDesc}>{t('adFreeDescription')}</Text>
              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cart" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.purchaseButtonText}>{t('purchaseAdFree')}</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestorePurchase}
              >
                <Text style={styles.restoreButtonText}>{t('restorePurchase')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.languageButtons}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  language === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageText,
                    language === lang.code && styles.languageTextActive,
                  ]}
                >
                  {lang.name}
                </Text>
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>{t('version')}</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  adFreeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
  },
  adFreeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adFreeTextContainer: {
    flex: 1,
  },
  adFreeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#50C878',
    marginBottom: 4,
  },
  adFreeDesc: {
    fontSize: 14,
    color: '#8E8E93',
  },
  purchaseCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
  },
  purchaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  purchaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  purchaseDesc: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 22,
  },
  purchaseButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginRight: 8,
  },
  restoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  languageButtons: {
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  languageButtonActive: {
    backgroundColor: '#2C2C2E',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  languageFlag: {
    fontSize: 24,
  },
  languageText: {
    flex: 1,
    fontSize: 17,
    color: '#8E8E93',
  },
  languageTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aboutItem: {
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  aboutValue: {
    fontSize: 17,
    color: '#8E8E93',
  },
});