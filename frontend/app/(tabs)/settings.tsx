import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/translations';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: t('english'), flag: '🇬🇧' },
    { code: 'ro', name: t('romanian'), flag: '🇷🇴' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.optionsContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionSelected,
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={styles.flagText}>{lang.flag}</Text>
                <Text style={[
                  styles.languageText,
                  language === lang.code && styles.languageTextSelected,
                ]}>
                  {lang.name}
                </Text>
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications')}</Text>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={handleTestNotifications}
            disabled={isSendingTest}
          >
            <View style={styles.testButtonContent}>
              <Ionicons name="notifications-outline" size={24} color="#4A90E2" />
              <View style={styles.testButtonText}>
                <Text style={styles.testButtonTitle}>{t('testNotifications')}</Text>
                <Text style={styles.testButtonDesc}>{t('testNotificationsDesc')}</Text>
              </View>
            </View>
            {isSendingTest ? (
              <Text style={styles.sendingText}>...</Text>
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            )}
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          <View style={styles.aboutContainer}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{t('version')}</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1C1C1E',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  optionsContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  languageOptionSelected: {
    backgroundColor: '#2C2C2E',
  },
  flagText: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
    fontSize: 17,
    color: '#FFFFFF',
  },
  languageTextSelected: {
    fontWeight: '600',
  },
  aboutContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  aboutLabel: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  aboutValue: {
    fontSize: 17,
    color: '#8E8E93',
  },
  testButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  testButtonTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  testButtonDesc: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sendingText: {
    fontSize: 17,
    color: '#8E8E93',
  },
});
