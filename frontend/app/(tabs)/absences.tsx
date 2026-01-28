import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

interface Absence {
  id: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  date: string;
  notes: string;
}

export default function Absences() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAbsences = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/absences`);
      const data = await response.json();
      setAbsences(data);
    } catch (error) {
      console.error('Error fetching absences:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAbsences();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAbsences();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const groupAbsencesByMonth = () => {
    const grouped: { [key: string]: Absence[] } = {};
    absences.forEach((absence) => {
      const date = new Date(absence.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(absence);
    });
    return grouped;
  };

  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const groupedAbsences = groupAbsencesByMonth();
  const monthKeys = Object.keys(groupedAbsences).sort().reverse();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Absences</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{absences.length}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A90E2" />
        }
      >
        {absences.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#34C759" />
            <Text style={styles.emptyStateText}>No absences recorded</Text>
            <Text style={styles.emptyStateSubtext}>Keep up the good attendance!</Text>
          </View>
        ) : (
          monthKeys.map((monthKey) => (
            <View key={monthKey} style={styles.monthSection}>
              <Text style={styles.monthLabel}>{getMonthLabel(monthKey)}</Text>
              {groupedAbsences[monthKey].map((absence) => (
                <View key={absence.id} style={styles.absenceCard}>
                  <View style={[styles.absenceColorBar, { backgroundColor: absence.courseColor }]} />
                  <View style={styles.absenceContent}>
                    <View style={styles.absenceHeader}>
                      <View style={styles.absenceInfo}>
                        <Text style={styles.courseName}>{absence.courseName}</Text>
                        <Text style={styles.dateText}>{formatDate(absence.date)}</Text>
                      </View>
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </View>
                    {absence.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesText}>{absence.notes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1C1C1E',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  monthSection: {
    marginBottom: 24,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  absenceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  absenceColorBar: {
    height: 4,
  },
  absenceContent: {
    padding: 16,
  },
  absenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  absenceInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});
