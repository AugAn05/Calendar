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
  TextInput,
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

export default function BulkAttendance() {
  const { courseId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [numberOfPresences, setNumberOfPresences] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, []);

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

  const handleSubmit = async () => {
    if (!numberOfPresences) {
      if (Platform.OS === 'web') {
        alert('Please select number of presences to add');
      } else {
        Alert.alert('Error', 'Please select number of presences to add');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate attendance list - all presences going backwards from today
      const today = new Date();
      const attendanceList = [];
      
      for (let i = numberOfPresences - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7)); // One week intervals
        attendanceList.push({
          date: date.toISOString().split('T')[0],
          status: 'present',
        });
      }

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
          alert(`Success! Added ${result.created} presences (skipped ${result.skipped} duplicates)`);
        } else {
          Alert.alert('Success', `Added ${result.created} presences (skipped ${result.skipped} duplicates)`);
        }
        router.back();
      } else {
        const error = await response.json();
        if (Platform.OS === 'web') {
          alert(error.detail || 'Failed to add bulk presences');
        } else {
          Alert.alert('Error', error.detail || 'Failed to add bulk presences');
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to add bulk presences');
      } else {
        Alert.alert('Error', 'Failed to add bulk presences');
      }
    } finally {
      setIsSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>Add Past Presences</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.courseCard, { borderLeftColor: course.color }]}>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.courseType}>{course.type}</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#4A90E2" />
          <Text style={styles.infoText}>
            Quickly add multiple past presences at once. Perfect for students who installed the app mid-semester!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How many classes did you attend?</Text>
          <Text style={styles.helpText}>
            Enter the number of past classes you were present for
          </Text>

          <TextInput
            style={styles.numberInput}
            value={numberOfPresences ? numberOfPresences.toString() : ''}
            onChangeText={(text) => {
              const num = parseInt(text);
              if (text === '' || (!isNaN(num) && num > 0 && num <= 100)) {
                setNumberOfPresences(text === '' ? null : num);
              }
            }}
            placeholder="e.g., 15"
            placeholderTextColor="#8E8E93"
            keyboardType="numeric"
          />
        </View>

        {numberOfPresences && (
          <View style={styles.summaryBox}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.summaryText}>
              Will add <Text style={styles.summaryBold}>{numberOfPresences} presences</Text> going back {Math.ceil(numberOfPresences / 4)} months (weekly intervals)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!numberOfPresences || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!numberOfPresences || isSubmitting}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Adding...' : `Add ${numberOfPresences || 0} Presences`}
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
    marginBottom: 16,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  numberInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  summaryBold: {
    fontWeight: '600',
    color: '#34C759',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
