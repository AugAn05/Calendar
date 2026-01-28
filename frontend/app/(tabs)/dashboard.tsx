import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

interface Course {
  id: string;
  name: string;
  type: string;
  minAttendancePercentage: number;
  minAttendanceClasses: number;
  totalClasses: number;
  attendedClasses: number;
  color: string;
  totalClassesInSemester: number;
}

export default function Dashboard() {
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

  const calculateAttendance = (course: Course) => {
    if (course.totalClasses === 0) return 0;
    return ((course.attendedClasses / course.totalClasses) * 100).toFixed(1);
  };

  const getStatusColor = (course: Course) => {
    const attendance = parseFloat(calculateAttendance(course));
    const threshold = course.minAttendancePercentage;
    
    if (attendance >= threshold) return '#34C759';
    if (attendance >= threshold - 5) return '#FF9500';
    return '#FF3B30';
  };

  const getClassesCanMiss = (course: Course) => {
    const threshold = course.minAttendancePercentage / 100;
    
    // Calculate theoretical classes that can be missed
    const theoreticalCanMiss = Math.floor(
      (course.attendedClasses - threshold * course.totalClasses) / threshold
    );
    
    // Calculate actual remaining classes in the semester
    const remainingClasses = course.totalClassesInSemester 
      ? Math.max(0, course.totalClassesInSemester - course.totalClasses)
      : theoreticalCanMiss; // If no semester total set, use theoretical
    
    // Can't miss more than what's remaining
    return Math.max(0, Math.min(theoreticalCanMiss, remainingClasses));
  };

  const getClassesNeeded = (course: Course) => {
    const threshold = course.minAttendancePercentage / 100;
    const needed = Math.ceil(
      (threshold * course.totalClasses - course.attendedClasses) / (1 - threshold)
    );
    
    // If totalClassesInSemester is set, cap to remaining classes
    if (course.totalClassesInSemester) {
      const remainingClasses = Math.max(0, course.totalClassesInSemester - course.totalClasses);
      // If more classes needed than remaining, it's impossible to reach threshold
      if (needed > remainingClasses) {
        return remainingClasses; // Show remaining classes with warning
      }
    }
    
    return Math.max(0, needed);
  };

  const renderCourseCard = (course: Course) => {
    const attendance = calculateAttendance(course);
    const statusColor = getStatusColor(course);
    const canMiss = getClassesCanMiss(course);
    const needed = getClassesNeeded(course);
    const isAboveThreshold = parseFloat(attendance) >= course.minAttendancePercentage;

    return (
      <View
        key={course.id}
        style={styles.courseCard}
      >
        <View style={[styles.courseColorBar, { backgroundColor: course.color }]} />
        <View style={styles.courseCardContent}>
          <View style={styles.courseHeader}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseType}>{course.type}</Text>
            </View>
            <View style={[styles.attendanceBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.attendancePercentage}>{attendance}%</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {course.totalClassesInSemester 
                  ? `${course.attendedClasses}/${course.totalClassesInSemester}`
                  : `${course.attendedClasses}/${course.totalClasses}`
                }
              </Text>
              <Text style={styles.statLabel}>
                {course.totalClassesInSemester ? `of ${course.totalClassesInSemester} total` : 'Classes Marked'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {course.minAttendancePercentage 
                  ? `${course.minAttendancePercentage}%`
                  : `${course.minAttendanceClasses} classes`
                }
              </Text>
              <Text style={styles.statLabel}>Required</Text>
            </View>
          </View>

          {course.totalClasses > 0 && (
            <View style={styles.warningContainer}>
              {isAboveThreshold ? (
                <View style={styles.warningBox}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={styles.warningText}>
                    You can miss {canMiss} more {canMiss === 1 ? 'class' : 'classes'}
                  </Text>
                </View>
              ) : (
                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={16} color="#FF3B30" />
                  <Text style={[styles.warningText, { color: '#FF3B30' }]}>
                    Attend next {needed} {needed === 1 ? 'class' : 'classes'} to reach threshold
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/mark-attendance?courseId=${course.id}`)}
            >
              <Ionicons name="add-circle" size={20} color="#4A90E2" />
              <Text style={styles.actionButtonText}>Mark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/bulk-attendance?courseId=${course.id}`)}
            >
              <Ionicons name="calendar" size={20} color="#9B59B6" />
              <Text style={styles.actionButtonText}>Bulk Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
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
    marginBottom: 16,
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
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attendancePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
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
  warningContainer: {
    marginTop: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
