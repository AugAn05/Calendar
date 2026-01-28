import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

interface Course {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  notes: string;
}

export default function MarkAttendance() {
  const { courseId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [courseResponse, attendanceResponse] = await Promise.all([
        fetch(`${API_URL}/courses/${courseId}`),
        fetch(`${API_URL}/attendance/course/${courseId}`),
      ]);
      
      const courseData = await courseResponse.json();
      const attendanceData = await attendanceResponse.json();
      
      setCourse(courseData);
      setAttendanceRecords(attendanceData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          date: dateString,
          status,
          notes: notes.trim(),
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Attendance marked successfully');
        router.back();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to mark attendance');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.courseCard, { borderLeftColor: course.color }]}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseType}>{course.type}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#4A90E2" />
              <Text style={styles.dateButtonText}>{formatDateDisplay(selectedDate)}</Text>
              <Ionicons name="chevron-down" size={20} color="#8E8E93" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
            <Text style={styles.dateHelp}>You can select any past date to add old absences</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === 'present' && styles.statusButtonPresent,
                ]}
                onPress={() => setStatus('present')}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color={status === 'present' ? '#FFFFFF' : '#34C759'}
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'present' && styles.statusButtonTextActive,
                  ]}
                >
                  Present
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === 'absent' && styles.statusButtonAbsent,
                ]}
                onPress={() => setStatus('absent')}
              >
                <Ionicons
                  name="close-circle"
                  size={32}
                  color={status === 'absent' ? '#FFFFFF' : '#FF3B30'}
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'absent' && styles.statusButtonTextActive,
                  ]}
                >
                  Absent
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a note..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Mark Attendance'}
            </Text>
          </TouchableOpacity>

          {attendanceRecords.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Recent Attendance</Text>
              {attendanceRecords.slice(0, 5).map((record) => (
                <View key={record.id} style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <Ionicons
                      name={record.status === 'present' ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={record.status === 'present' ? '#34C759' : '#FF3B30'}
                    />
                    <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
                  </View>
                  <Text style={styles.historyStatus}>{record.status}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  dateInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  dateHelp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statusButtonPresent: {
    backgroundColor: '#34C759',
  },
  statusButtonAbsent: {
    backgroundColor: '#FF3B30',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyDate: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  historyStatus: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
});
