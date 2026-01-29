export type Language = 'en' | 'ro';

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    courses: 'Courses',
    absences: 'Absences',
    settings: 'Settings',
    
    // Dashboard
    noCourses: 'No courses yet',
    tapToAdd: 'Tap + to add your first course',
    classesMarked: 'Classes Marked',
    ofTotal: 'of {total} total',
    required: 'Required',
    classes: 'classes',
    metRequirement: 'You have met the minimum presence requirement ✓',
    needToAttend: 'You need to attend {count} more {classWord} to meet the minimum requirement',
    classWord: 'class',
    classesWord: 'classes',
    mark: 'Mark',
    bulkAdd: 'Bulk Add',
    
    // Courses
    current: 'Current',
    progress: 'Progress',
    noSchedule: 'No schedule set',
    
    // Absences
    noAbsences: 'No absences recorded',
    keepUp: 'Keep up the good attendance!',
    
    // Settings
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    romanian: 'Română',
    appSettings: 'App Settings',
    about: 'About',
    version: 'Version',
    
    // Add/Edit Course
    addCourse: 'Add Course',
    editCourse: 'Edit Course',
    courseName: 'Course Name',
    courseType: 'Course Type',
    course: 'Course',
    seminar: 'Seminar',
    laboratory: 'Laboratory',
    lecture: 'Lecture',
    totalClassesInSemester: 'Total Classes in Semester',
    optional: 'optional',
    attendanceRequirement: 'Attendance Requirement',
    minimumPercentage: 'Minimum Percentage',
    minimumClasses: 'Minimum Classes',
    schedule: 'Schedule',
    addSchedule: 'Add Schedule',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    basicInformation: 'Basic Information',
    minAttendancePercentageLabel: 'Minimum Attendance (%) - Optional',
    minAttendanceClassesLabel: 'Minimum Classes Needed - Optional',
    totalClassesLabel: 'Total Classes in Semester (Optional)',
    color: 'Color',
    slot: 'Slot',
    day: 'Day',
    startTime: 'Start Time',
    endTime: 'End Time',
    noScheduleAdded: 'No schedule added yet',
    tapPlusToAdd: 'Tap + to add a time slot',
    atLeastOneRequired: '* At least one attendance requirement is required',
    setTotalClassesHelp: 'Set this if you know how many classes total in the semester',
    type: 'Type',
    
    // Mark Attendance
    markAttendance: 'Mark Attendance',
    selectDate: 'Select Date',
    status: 'Status',
    present: 'Present',
    absent: 'Absent',
    notes: 'Notes',
    addNotes: 'Add notes...',
    
    // Bulk Attendance
    bulkAttendance: 'Bulk Add Presences',
    numberOfPresences: 'Number of Presences to Add',
    addPresences: 'Add Presences',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    
    // Notifications
    notificationAfterClassTitle: 'Class Just Ended!',
    notificationAfterClassBody: "Don't forget to mark your attendance for {courseName}",
    notificationBeforeClassTitle: 'Upcoming Class',
    notificationBeforeClassBody: '{courseName} starts soon. You need {needed} more {classWord} to meet the requirement',
    notificationBeforeClassBodyMet: '{courseName} starts soon. You have met the attendance requirement!',
    
    // Delete Dialog
    deleteTitle: 'Delete Course',
    deleteMessage: 'Are you sure you want to delete "{name}"? This will also delete all attendance records.',
    
    // Days
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
  ro: {
    // Navigation
    dashboard: 'Panou',
    courses: 'Cursuri',
    absences: 'Absențe',
    settings: 'Setări',
    
    // Dashboard
    noCourses: 'Niciun curs încă',
    tapToAdd: 'Apasă + pentru a adăuga primul curs',
    classesMarked: 'Ore marcate',
    ofTotal: 'din {total} total',
    required: 'Necesar',
    classes: 'ore',
    metRequirement: 'Ai îndeplinit cerința minimă de prezență ✓',
    needToAttend: 'Trebuie să participi la încă {count} {classWord} pentru a îndeplini cerința minimă',
    classWord: 'oră',
    classesWord: 'ore',
    mark: 'Marchează',
    bulkAdd: 'Prezențe trecute',
    
    // Courses
    current: 'Actual',
    progress: 'Progres',
    noSchedule: 'Fără program stabilit',
    
    // Absences
    noAbsences: 'Nicio absență înregistrată',
    keepUp: 'Continuă să participi!',
    
    // Settings
    language: 'Limbă',
    selectLanguage: 'Selectează limba',
    english: 'English',
    romanian: 'Română',
    appSettings: 'Setări aplicație',
    about: 'Despre',
    version: 'Versiune',
    
    // Add/Edit Course
    addCourse: 'Adaugă Curs',
    editCourse: 'Editează Curs',
    courseName: 'Nume Curs',
    courseType: 'Tip Curs',
    course: 'Curs',
    seminar: 'Seminar',
    laboratory: 'Laborator',
    lecture: 'Prelegere',
    totalClassesInSemester: 'Total ore în semestru',
    optional: 'opțional',
    attendanceRequirement: 'Cerință de prezență',
    minimumPercentage: 'Procent minim',
    minimumClasses: 'Număr minim de ore',
    schedule: 'Program',
    addSchedule: 'Adaugă Program',
    save: 'Salvează',
    cancel: 'Anulează',
    delete: 'Șterge',
    basicInformation: 'Informații de bază',
    minAttendancePercentageLabel: 'Prezență minimă (%) - Opțional',
    minAttendanceClassesLabel: 'Ore minime necesare - Opțional',
    totalClassesLabel: 'Total ore în semestru (Opțional)',
    color: 'Culoare',
    slot: 'Slot',
    day: 'Zi',
    startTime: 'Ora de început',
    endTime: 'Ora de sfârșit',
    noScheduleAdded: 'Niciun program adăugat încă',
    tapPlusToAdd: 'Apasă + pentru a adăuga un interval',
    atLeastOneRequired: '* Este necesară cel puțin o cerință de prezență',
    setTotalClassesHelp: 'Setează dacă știi câte ore sunt în total în semestru',
    type: 'Tip',
    
    // Mark Attendance
    markAttendance: 'Marchează Prezența',
    selectDate: 'Selectează Data',
    status: 'Status',
    present: 'Prezent',
    absent: 'Absent',
    notes: 'Note',
    addNotes: 'Adaugă note...',
    
    // Bulk Attendance
    bulkAttendance: 'Adaugă Prezențe în Bloc',
    numberOfPresences: 'Număr de prezențe de adăugat',
    addPresences: 'Adaugă Prezențe',
    
    // Common
    loading: 'Se încarcă...',
    error: 'Eroare',
    success: 'Succes',
    confirm: 'Confirmă',
    
    // Delete Dialog
    deleteTitle: 'Șterge Curs',
    deleteMessage: 'Ești sigur că vrei să ștergi "{name}"? Aceasta va șterge și toate înregistrările de prezență.',
    
    // Days
    monday: 'Luni',
    tuesday: 'Marți',
    wednesday: 'Miercuri',
    thursday: 'Joi',
    friday: 'Vineri',
    saturday: 'Sâmbătă',
    sunday: 'Duminică',
  },
};

export type TranslationKeys = keyof typeof translations.en;
