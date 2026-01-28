import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

interface Course {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface AttendanceItem {
  date: string;
  status: 'present' | 'absent';
}

export default function BulkAttendance() {
  const { courseId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [numberOfClasses, setNumberOfClasses] = useState(10);
  const [attendanceList, setAttendanceList] = useState<AttendanceItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, []);

  useEffect(() => {
    // Generate attendance list based on number of classes
    const today = new Date();
    const list: AttendanceItem[] = [];
    
    for (let i = numberOfClasses - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7)); // One week intervals
      list.push({
        date: date.toISOString().split('T')[0],
        status: 'present',
      });
    }
    
    setAttendanceList(list);
  }, [numberOfClasses]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`);
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load course');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (index: number) => {
    const newList = [...attendanceList];
    newList[index].status = newList[index].status === 'present' ? 'absent' : 'present';
    setAttendanceList(newList);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          attendanceList,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (Platform.OS === 'web') {
          alert(`Success! Created ${result.created} records, skipped ${result.skipped} duplicates`);
        } else {
          Alert.alert('Success', `Created ${result.created} records, skipped ${result.skipped} duplicates`);
        }
        router.back();
      } else {
        const error = await response.json();
        if (Platform.OS === 'web') {
          alert(error.detail || 'Failed to create bulk attendance');
        } else {
          Alert.alert('Error', error.detail || 'Failed to create bulk attendance');
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to create bulk attendance');
      } else {
        Alert.alert('Error', 'Failed to create bulk attendance');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bulk Attendance</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.courseCard, { borderLeftColor: course.color }]}>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.courseType}>{course.type}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Past Classes</Text>
          <View style={styles.numberButtons}>
            {[5, 10, 15, 20].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.numberButton,
                  numberOfClasses === num && styles.numberButtonActive,
                ]}
                onPress={() => setNumberOfClasses(num)}
              >
                <Text
                  style={[
                    styles.numberButtonText,
                    numberOfClasses === num && styles.numberButtonTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>
            Select how many past classes to add (one per week)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mark Attendance</Text>
          <Text style={styles.helpText}>
            Tap any class to toggle between Present and Absent
          </Text>

          {attendanceList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.attendanceItem,
                item.status === 'present' ? styles.presentItem : styles.absentItem,
              ]}
              onPress={() => toggleStatus(index)}
            >
              <View style={styles.attendanceItemLeft}>
                <Ionicons
                  name={item.status === 'present' ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={item.status === 'present' ? '#34C759' : '#FF3B30'}
                />
                <View style={styles.attendanceItemInfo}>
                  <Text style={styles.attendanceDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.attendanceWeekAgo}>
                    {numberOfClasses - index - 1 === 0
                      ? 'This week'
                      : `${numberOfClasses - index - 1} ${numberOfClasses - index - 1 === 1 ? 'week' : 'weeks'} ago`}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'present' ? styles.presentBadge : styles.absentBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'present' ? styles.presentText : styles.absentText,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : `Add ${numberOfClasses} Records`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  courseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  courseType: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  numberButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  numberButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    alignItems: 'center',
  },
  numberButtonActive: {
    backgroundColor: '#4A90E2',
  },
  numberButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  numberButtonTextActive: {
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  presentItem: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  absentItem: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  attendanceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attendanceItemInfo: {
    marginLeft: 12,
  },
  attendanceDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  attendanceWeekAgo: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  presentBadge: {
    backgroundColor: '#34C759',
  },
  absentBadge: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  presentText: {
    color: '#FFFFFF',
  },
  absentText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
