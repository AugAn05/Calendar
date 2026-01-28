import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmDialog from '../../components/ConfirmDialog';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

interface Course {
  id: string;
  name: string;
  type: string;
  schedule: Array<{ day: string; startTime: string; endTime: string }>;
  minAttendancePercentage: number;
  minAttendanceClasses: number;
  totalClasses: number;
  attendedClasses: number;
  color: string;
  totalClassesInSemester: number;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleDelete = async (course: Course) => {
    console.log('Delete button clicked for:', course.name);
    console.log('Platform.OS:', Platform.OS);
    
    // Use native confirm on web, Alert.alert on mobile
    if (Platform.OS === 'web') {
      console.log('Using web confirm dialog');
      const confirmed = confirm(
        `Are you sure you want to delete "${course.name}"? This will also delete all attendance records.`
      );
      console.log('Confirm result:', confirmed);
      if (!confirmed) {
        console.log('User cancelled');
        return;
      }
      
      try {
        console.log('Deleting course:', course.id);
        const response = await fetch(`${API_URL}/courses/${course.id}`, {
          method: 'DELETE',
        });
        console.log('Delete response status:', response.status);
        if (response.ok) {
          alert('Course deleted successfully');
          fetchCourses();
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Delete error:', errorData);
          alert(errorData.detail || 'Failed to delete course');
        }
      } catch (error: any) {
        console.error('Delete exception:', error);
        alert('Failed to delete course: ' + error.message);
      }
    } else {
      console.log('Using mobile Alert.alert');
      Alert.alert(
        'Delete Course',
        `Are you sure you want to delete "${course.name}"? This will also delete all attendance records.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Deleting course:', course.id);
                const response = await fetch(`${API_URL}/courses/${course.id}`, {
                  method: 'DELETE',
                });
                console.log('Delete response status:', response.status);
                if (response.ok) {
                  Alert.alert('Success', 'Course deleted successfully');
                  fetchCourses();
                } else {
                  const errorData = await response.json().catch(() => ({}));
                  console.error('Delete error:', errorData);
                  Alert.alert('Error', errorData.detail || 'Failed to delete course');
                }
              } catch (error: any) {
                console.error('Delete exception:', error);
                Alert.alert('Error', 'Failed to delete course: ' + error.message);
              }
            },
          },
        ]
      );
    }
  };

  const calculateAttendance = (course: Course) => {
    if (course.totalClasses === 0) return '0.0';
    return ((course.attendedClasses / course.totalClasses) * 100).toFixed(1);
  };

  const formatSchedule = (schedule: Array<{ day: string; startTime: string; endTime: string }>) => {
    if (!schedule || schedule.length === 0) return 'No schedule set';
    return schedule
      .map((s) => `${s.day} ${s.startTime}-${s.endTime}`)
      .join(', ');
  };

  const renderCourseCard = (course: Course) => {
    const attendance = calculateAttendance(course);

    return (
      <View key={course.id} style={styles.courseCard}>
        <View style={[styles.courseColorBar, { backgroundColor: course.color }]} />
        <View style={styles.courseCardContent}>
          <View style={styles.courseHeader}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseType}>{course.type}</Text>
            </View>
            <View style={styles.courseActions}>
              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  console.log('Edit button clicked');
                  router.push(`/edit-course?courseId=${course.id}`);
                }}
              >
                <Ionicons name="create-outline" size={24} color="#4A90E2" />
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  console.log('DELETE BUTTON PRESSED for:', course.name, course.id);
                  handleDelete(course);
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </Pressable>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{formatSchedule(course.schedule)}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{attendance}%</Text>
              <Text style={styles.statLabel}>Current</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {course.minAttendancePercentage 
                  ? `${course.minAttendancePercentage}%`
                  : `${course.minAttendanceClasses}`
                }
              </Text>
              <Text style={styles.statLabel}>Required</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {course.totalClassesInSemester 
                  ? `${course.attendedClasses}/${course.totalClassesInSemester}`
                  : `${course.attendedClasses}/${course.totalClasses}`
                }
              </Text>
              <Text style={styles.statLabel}>
                {course.totalClassesInSemester ? 'Progress' : 'Classes'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Courses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-course')}
        >
          <Ionicons name="add" size={28} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A90E2" />
        }
      >
        {courses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No courses yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap + to add your first course</Text>
          </View>
        ) : (
          courses.map(renderCourseCard)
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
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  courseColorBar: {
    height: 4,
  },
  courseCardContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
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
  courseActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 12,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
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
