import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n/LanguageContext';
import { scheduleCourseNotifications } from '../services/notificationService';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

const COLORS = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6', '#3498DB', '#E74C3C'];

interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export default function EditCourse() {
  const { courseId } = useLocalSearchParams();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState<'course' | 'seminar'>('course');
  const [minAttendance, setMinAttendance] = useState('');
  const [minAttendanceClasses, setMinAttendanceClasses] = useState('');
  const [totalClassesInSemester, setTotalClassesInSemester] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Days array using translations
  const DAYS = [
    { key: 'Monday', label: t('monday') },
    { key: 'Tuesday', label: t('tuesday') },
    { key: 'Wednesday', label: t('wednesday') },
    { key: 'Thursday', label: t('thursday') },
    { key: 'Friday', label: t('friday') },
    { key: 'Saturday', label: t('saturday') },
    { key: 'Sunday', label: t('sunday') },
  ];

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`);
      const data = await response.json();
      setName(data.name);
      setType(data.type);
      if (data.minAttendancePercentage) {
        setMinAttendance(data.minAttendancePercentage.toString());
      }
      if (data.minAttendanceClasses) {
        setMinAttendanceClasses(data.minAttendanceClasses.toString());
      }
      setSelectedColor(data.color);
      setSchedule(data.schedule);
      if (data.totalClassesInSemester) {
        setTotalClassesInSemester(data.totalClassesInSemester.toString());
      }
    } catch (error) {
      Alert.alert(t('error'), 'Failed to load course');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const addScheduleSlot = () => {
    setSchedule([...schedule, { day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
  };

  const removeScheduleSlot = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (index: number, field: keyof ScheduleSlot, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a course name');
      return false;
    }
    const attendance = parseFloat(minAttendance);
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      Alert.alert('Error', 'Minimum attendance must be between 0 and 100');
      return false;
    }
    if (schedule.length === 0) {
      Alert.alert('Error', 'Please add at least one schedule slot');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const bodyData: any = {
        name: name.trim(),
        type,
        schedule,
        minAttendancePercentage: parseFloat(minAttendance),
        color: selectedColor,
      };
      
      // Only include totalClassesInSemester if it has a value
      if (totalClassesInSemester && totalClassesInSemester.trim() !== '') {
        bodyData.totalClassesInSemester = parseInt(totalClassesInSemester);
      }

      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Course updated successfully');
        router.back();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to update course');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update course');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editCourse')}</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.saveButton}
        >
          <Text style={[styles.saveButtonText, isSubmitting && styles.saveButtonDisabled]}>
            {t('save')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('basicInformation')}</Text>
            
            <Text style={styles.label}>{t('courseName')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Data Structures"
              placeholderTextColor="#8E8E93"
            />

            <Text style={styles.label}>{t('type')}</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'course' && styles.typeButtonActive,
                ]}
                onPress={() => setType('course')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'course' && styles.typeButtonTextActive,
                  ]}
                >
                  {t('course')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'seminar' && styles.typeButtonActive,
                ]}
                onPress={() => setType('seminar')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'seminar' && styles.typeButtonTextActive,
                  ]}
                >
                  {t('seminar')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('minAttendancePercentageLabel')}</Text>
            <TextInput
              style={styles.input}
              value={minAttendance}
              onChangeText={setMinAttendance}
              placeholder="75"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Total Classes in Semester (Optional)</Text>
            <TextInput
              style={styles.input}
              value={totalClassesInSemester}
              onChangeText={setTotalClassesInSemester}
              placeholder="e.g., 30"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
            />
            <Text style={styles.helpText}>
              Set this if you know how many classes total in the semester
            </Text>

            <Text style={styles.label}>{t('color')}}</Text>
            <View style={styles.colorPicker}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('schedule')}}</Text>
              <TouchableOpacity onPress={addScheduleSlot} style={styles.addScheduleButton}>
                <Ionicons name="add" size={24} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            {schedule.map((slot, index) => (
              <View key={index} style={styles.scheduleSlot}>
                <View style={styles.scheduleSlotHeader}>
                  <Text style={styles.scheduleSlotTitle}>Slot {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeScheduleSlot(index)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>{t('day')}}</Text>
                <View style={styles.dayButtons}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day.key}
                      style={[
                        styles.dayButton,
                        slot.day === day.key && styles.dayButtonActive,
                      ]}
                      onPress={() => updateScheduleSlot(index, 'day', day.key)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          slot.day === day.key && styles.dayButtonTextActive,
                        ]}
                      >
                        {day.label.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Text style={styles.label}>{t('startTime')}}</Text>
                    <TextInput
                      style={styles.input}
                      value={slot.startTime}
                      onChangeText={(value) => updateScheduleSlot(index, 'startTime', value)}
                      placeholder="09:00"
                      placeholderTextColor="#8E8E93"
                    />
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={styles.label}>{t('endTime')}}</Text>
                    <TextInput
                      style={styles.input}
                      value={slot.endTime}
                      onChangeText={(value) => updateScheduleSlot(index, 'endTime', value)}
                      placeholder="10:00"
                      placeholderTextColor="#8E8E93"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
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
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
    marginTop: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  addScheduleButton: {
    padding: 4,
  },
  scheduleSlot: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduleSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleSlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  dayButtonActive: {
    backgroundColor: '#4A90E2',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
});
