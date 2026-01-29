import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface Course {
  id: string;
  name: string;
  type: string;
  schedule: Array<{ day: string; startTime: string; endTime: string }>;
  minAttendancePercentage?: number;
  minAttendanceClasses?: number;
  totalClasses: number;
  attendedClasses: number;
  totalClassesInSemester?: number;
}

interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
}

const DAY_MAP: { [key: string]: number } = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Course Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A90E2',
    });
  }

  return true;
}

// Calculate classes needed
function calculateClassesNeeded(course: Course): number {
  let minRequired;
  
  if (course.minAttendanceClasses) {
    minRequired = course.minAttendanceClasses;
  } else if (course.minAttendancePercentage && course.totalClassesInSemester) {
    minRequired = Math.ceil((course.minAttendancePercentage / 100) * course.totalClassesInSemester);
  } else {
    const total = course.totalClassesInSemester || course.totalClasses;
    minRequired = Math.ceil(0.75 * total);
  }
  
  const needed = minRequired - course.attendedClasses;
  return Math.max(0, needed);
}

// Get next occurrence of a day/time
function getNextOccurrence(dayOfWeek: number, hour: number, minute: number): Date {
  const now = new Date();
  const result = new Date();
  
  result.setHours(hour, minute, 0, 0);
  
  // Calculate days until next occurrence
  let daysUntil = dayOfWeek - now.getDay();
  if (daysUntil < 0 || (daysUntil === 0 && now.getTime() >= result.getTime())) {
    daysUntil += 7;
  }
  
  result.setDate(now.getDate() + daysUntil);
  return result;
}

// Parse time string (HH:MM format)
function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

// Schedule notification for after class ends (5 minutes after)
async function scheduleAfterClassNotification(
  course: Course,
  slot: ScheduleSlot,
  language: string
): Promise<string | null> {
  try {
    const { hour, minute } = parseTime(slot.endTime);
    const dayOfWeek = DAY_MAP[slot.day];
    
    if (dayOfWeek === undefined) {
      console.error('Invalid day:', slot.day);
      return null;
    }
    
    // Schedule for 5 minutes after class ends
    const triggerDate = getNextOccurrence(dayOfWeek, hour, minute);
    triggerDate.setMinutes(triggerDate.getMinutes() + 5);
    
    const title = language === 'ro' 
      ? 'Ora tocmai s-a terminat!'
      : 'Class Just Ended!';
    
    const body = language === 'ro'
      ? `Nu uita să marchezi prezența pentru ${course.name}`
      : `Don't forget to mark your attendance for ${course.name}`;
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          courseId: course.id, 
          type: 'after-class',
          courseName: course.name 
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        repeats: true,
        weekday: dayOfWeek + 1, // expo-notifications uses 1-7 for Sunday-Saturday
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
      },
    });
    
    console.log(`Scheduled after-class notification for ${course.name} on ${slot.day}:`, notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling after-class notification:', error);
    return null;
  }
}

// Schedule notification before class starts (10 minutes before)
async function scheduleBeforeClassNotification(
  course: Course,
  slot: ScheduleSlot,
  language: string
): Promise<string | null> {
  try {
    const { hour, minute } = parseTime(slot.startTime);
    const dayOfWeek = DAY_MAP[slot.day];
    
    if (dayOfWeek === undefined) {
      console.error('Invalid day:', slot.day);
      return null;
    }
    
    // Schedule for 10 minutes before class starts
    const triggerDate = getNextOccurrence(dayOfWeek, hour, minute);
    triggerDate.setMinutes(triggerDate.getMinutes() - 10);
    
    const needed = calculateClassesNeeded(course);
    const classWord = language === 'ro' ? (needed === 1 ? 'oră' : 'ore') : (needed === 1 ? 'class' : 'classes');
    
    const title = language === 'ro' 
      ? 'Oră următoare'
      : 'Upcoming Class';
    
    let body;
    if (needed > 0) {
      body = language === 'ro'
        ? `${course.name} începe în curând. Mai trebuie să participi la ${needed} ${classWord}`
        : `${course.name} starts soon. You need ${needed} more ${classWord} to meet the requirement`;
    } else {
      body = language === 'ro'
        ? `${course.name} începe în curând. Ai îndeplinit cerința de prezență!`
        : `${course.name} starts soon. You have met the attendance requirement!`;
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          courseId: course.id, 
          type: 'before-class',
          courseName: course.name,
          needed 
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        repeats: true,
        weekday: dayOfWeek + 1,
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
      },
    });
    
    console.log(`Scheduled before-class notification for ${course.name} on ${slot.day}:`, notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling before-class notification:', error);
    return null;
  }
}

// Schedule all notifications for a course
export async function scheduleCourseNotifications(
  course: Course,
  language: string = 'en'
): Promise<void> {
  try {
    // Cancel existing notifications for this course
    await cancelCourseNotifications(course.id);
    
    const notificationIds: string[] = [];
    
    // Schedule notifications for each schedule slot
    for (const slot of course.schedule) {
      // After class notification
      const afterId = await scheduleAfterClassNotification(course, slot, language);
      if (afterId) notificationIds.push(afterId);
      
      // Before class notification
      const beforeId = await scheduleBeforeClassNotification(course, slot, language);
      if (beforeId) notificationIds.push(beforeId);
    }
    
    // Store notification IDs for this course
    await AsyncStorage.setItem(
      `notifications_${course.id}`,
      JSON.stringify(notificationIds)
    );
    
    console.log(`Scheduled ${notificationIds.length} notifications for course:`, course.name);
  } catch (error) {
    console.error('Error scheduling course notifications:', error);
  }
}

// Cancel all notifications for a course
export async function cancelCourseNotifications(courseId: string): Promise<void> {
  try {
    const notificationIdsStr = await AsyncStorage.getItem(`notifications_${courseId}`);
    
    if (notificationIdsStr) {
      const notificationIds: string[] = JSON.parse(notificationIdsStr);
      
      for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      
      await AsyncStorage.removeItem(`notifications_${courseId}`);
      console.log(`Cancelled ${notificationIds.length} notifications for course:`, courseId);
    }
  } catch (error) {
    console.error('Error cancelling course notifications:', error);
  }
}

// Reschedule all notifications for all courses
export async function rescheduleAllNotifications(language: string = 'en'): Promise<void> {
  try {
    // Fetch all courses
    const response = await fetch(`${API_URL}/courses`);
    const courses: Course[] = await response.json();
    
    // Schedule notifications for each course
    for (const course of courses) {
      if (course.schedule && course.schedule.length > 0) {
        await scheduleCourseNotifications(course, language);
      }
    }
    
    console.log(`Rescheduled notifications for ${courses.length} courses`);
  } catch (error) {
    console.error('Error rescheduling all notifications:', error);
  }
}

// Initialize notifications (call on app start)
export async function initializeNotifications(language: string = 'en'): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  
  if (hasPermission) {
    // Reschedule all notifications
    await rescheduleAllNotifications(language);
  }
}

// Test notification - sends immediately
export async function sendTestNotifications(language: string = 'en'): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    // Test notification 1: After class reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: language === 'ro' ? 'Test: Ora tocmai s-a terminat!' : 'Test: Class Just Ended!',
        body: language === 'ro' 
          ? 'Nu uita să marchezi prezența pentru Structuri de Date'
          : "Don't forget to mark your attendance for Data Structures",
        data: { type: 'test', notificationType: 'after-class' },
        sound: true,
      },
      trigger: {
        seconds: 2, // Trigger in 2 seconds
      },
    });

    // Test notification 2: Before class alert
    await Notifications.scheduleNotificationAsync({
      content: {
        title: language === 'ro' ? 'Test: Oră următoare' : 'Test: Upcoming Class',
        body: language === 'ro'
          ? 'Algoritmi începe în curând. Mai trebuie să participi la 3 ore'
          : 'Algorithms starts soon. You need 3 more classes to meet the requirement',
        data: { type: 'test', notificationType: 'before-class' },
        sound: true,
      },
      trigger: {
        seconds: 5, // Trigger in 5 seconds
      },
    });

    console.log('Test notifications scheduled!');
    return Promise.resolve();
  } catch (error) {
    console.error('Error sending test notifications:', error);
    throw error;
  }
}
