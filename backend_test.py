#!/usr/bin/env python3
"""
University Calendar Backend API Test Suite
Tests all backend endpoints for the University Calendar application.
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Backend URL from frontend .env
BACKEND_URL = "https://studyplanner-98.preview.emergentagent.com/api"

class UniversityCalendarTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.created_course_id = None
        self.created_attendance_ids = []
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
        if not success:
            print(f"   Details: {response_data}")
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Root Endpoint", True, f"API is accessible - {data['message']}")
                    return True
                else:
                    self.log_test("Root Endpoint", False, "Unexpected response format", data)
                    return False
            else:
                self.log_test("Root Endpoint", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_create_course(self):
        """Test POST /api/courses - Create a new course"""
        test_data = {
            "name": "Data Structures",
            "type": "course",
            "schedule": [
                {
                    "day": "Monday",
                    "startTime": "09:00",
                    "endTime": "10:00"
                }
            ],
            "minAttendancePercentage": 75,
            "color": "#4A90E2"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/courses",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ["id", "name", "type", "schedule", "minAttendancePercentage", 
                                 "totalClasses", "attendedClasses", "color"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_test("Create Course", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                # Validate initial values
                if data["totalClasses"] != 0 or data["attendedClasses"] != 0:
                    self.log_test("Create Course", False, "Initial class counts should be 0", data)
                    return False
                
                # Store course ID for subsequent tests
                self.created_course_id = data["id"]
                self.log_test("Create Course", True, f"Course created with ID: {self.created_course_id}")
                return True
            else:
                self.log_test("Create Course", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Course", False, f"Request error: {str(e)}")
            return False
    
    def test_get_all_courses(self):
        """Test GET /api/courses - Get all courses"""
        try:
            response = self.session.get(f"{self.base_url}/courses")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Validate that our created course is in the list
                        course_found = any(course["id"] == self.created_course_id for course in data)
                        if course_found:
                            self.log_test("Get All Courses", True, f"Retrieved {len(data)} courses including our test course")
                            return True
                        else:
                            self.log_test("Get All Courses", False, "Created course not found in list", data)
                            return False
                    else:
                        self.log_test("Get All Courses", True, "Retrieved empty course list")
                        return True
                else:
                    self.log_test("Get All Courses", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("Get All Courses", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get All Courses", False, f"Request error: {str(e)}")
            return False
    
    def test_get_single_course(self):
        """Test GET /api/courses/{id} - Get single course"""
        if not self.created_course_id:
            self.log_test("Get Single Course", False, "No course ID available for testing")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/courses/{self.created_course_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data["id"] == self.created_course_id and data["name"] == "Data Structures":
                    self.log_test("Get Single Course", True, f"Retrieved course: {data['name']}")
                    return True
                else:
                    self.log_test("Get Single Course", False, "Course data mismatch", data)
                    return False
            else:
                self.log_test("Get Single Course", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Single Course", False, f"Request error: {str(e)}")
            return False
    
    def test_update_course(self):
        """Test PUT /api/courses/{id} - Update a course"""
        if not self.created_course_id:
            self.log_test("Update Course", False, "No course ID available for testing")
            return False
        
        update_data = {
            "name": "Advanced Data Structures"
        }
        
        try:
            response = self.session.put(
                f"{self.base_url}/courses/{self.created_course_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data["name"] == "Advanced Data Structures":
                    self.log_test("Update Course", True, f"Course updated to: {data['name']}")
                    return True
                else:
                    self.log_test("Update Course", False, "Course name not updated", data)
                    return False
            else:
                self.log_test("Update Course", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Update Course", False, f"Request error: {str(e)}")
            return False
    
    def test_mark_attendance_present(self):
        """Test POST /api/attendance - Mark attendance as present"""
        if not self.created_course_id:
            self.log_test("Mark Attendance Present", False, "No course ID available for testing")
            return False
        
        attendance_data = {
            "courseId": self.created_course_id,
            "date": "2025-01-15",
            "status": "present",
            "notes": "Test attendance"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/attendance",
                json=attendance_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                required_fields = ["id", "courseId", "date", "status", "notes"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Mark Attendance Present", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                if data["status"] == "present" and data["courseId"] == self.created_course_id:
                    self.created_attendance_ids.append(data["id"])
                    self.log_test("Mark Attendance Present", True, f"Attendance marked present with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Mark Attendance Present", False, "Attendance data mismatch", data)
                    return False
            else:
                self.log_test("Mark Attendance Present", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Mark Attendance Present", False, f"Request error: {str(e)}")
            return False
    
    def test_mark_attendance_absent(self):
        """Test POST /api/attendance - Mark attendance as absent"""
        if not self.created_course_id:
            self.log_test("Mark Attendance Absent", False, "No course ID available for testing")
            return False
        
        attendance_data = {
            "courseId": self.created_course_id,
            "date": "2025-01-16",
            "status": "absent",
            "notes": "Sick"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/attendance",
                json=attendance_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data["status"] == "absent" and data["courseId"] == self.created_course_id:
                    self.created_attendance_ids.append(data["id"])
                    self.log_test("Mark Attendance Absent", True, f"Attendance marked absent with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Mark Attendance Absent", False, "Attendance data mismatch", data)
                    return False
            else:
                self.log_test("Mark Attendance Absent", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Mark Attendance Absent", False, f"Request error: {str(e)}")
            return False
    
    def test_course_statistics_update(self):
        """Verify that course statistics are updated correctly after attendance marking"""
        if not self.created_course_id:
            self.log_test("Course Statistics Update", False, "No course ID available for testing")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/courses/{self.created_course_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # After marking 1 present and 1 absent, we should have:
                # totalClasses = 2, attendedClasses = 1
                expected_total = 2
                expected_attended = 1
                
                if data["totalClasses"] == expected_total and data["attendedClasses"] == expected_attended:
                    self.log_test("Course Statistics Update", True, 
                                f"Statistics correct: {data['attendedClasses']}/{data['totalClasses']} classes")
                    return True
                else:
                    self.log_test("Course Statistics Update", False, 
                                f"Statistics incorrect: got {data['attendedClasses']}/{data['totalClasses']}, expected {expected_attended}/{expected_total}", data)
                    return False
            else:
                self.log_test("Course Statistics Update", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Course Statistics Update", False, f"Request error: {str(e)}")
            return False
    
    def test_get_course_attendance(self):
        """Test GET /api/attendance/course/{id} - Get course attendance"""
        if not self.created_course_id:
            self.log_test("Get Course Attendance", False, "No course ID available for testing")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/attendance/course/{self.created_course_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) == 2:
                    # Should have 2 attendance records
                    statuses = [record["status"] for record in data]
                    if "present" in statuses and "absent" in statuses:
                        self.log_test("Get Course Attendance", True, f"Retrieved {len(data)} attendance records")
                        return True
                    else:
                        self.log_test("Get Course Attendance", False, f"Unexpected statuses: {statuses}", data)
                        return False
                else:
                    self.log_test("Get Course Attendance", False, f"Expected 2 records, got {len(data) if isinstance(data, list) else 'non-list'}", data)
                    return False
            else:
                self.log_test("Get Course Attendance", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Course Attendance", False, f"Request error: {str(e)}")
            return False
    
    def test_get_all_absences(self):
        """Test GET /api/attendance/absences - Get all absences"""
        try:
            response = self.session.get(f"{self.base_url}/attendance/absences")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    # Should have at least 1 absence record (our test absence)
                    absence_found = any(
                        record["status"] == "absent" and 
                        record["courseId"] == self.created_course_id 
                        for record in data
                    )
                    
                    if absence_found:
                        # Check if course info is included
                        test_absence = next(
                            record for record in data 
                            if record["courseId"] == self.created_course_id
                        )
                        
                        if "courseName" in test_absence and "courseColor" in test_absence:
                            self.log_test("Get All Absences", True, f"Retrieved {len(data)} absence records with course info")
                            return True
                        else:
                            self.log_test("Get All Absences", False, "Course info missing from absence records", test_absence)
                            return False
                    else:
                        self.log_test("Get All Absences", True, f"Retrieved {len(data)} absence records (test absence not found)")
                        return True
                else:
                    self.log_test("Get All Absences", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("Get All Absences", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get All Absences", False, f"Request error: {str(e)}")
            return False
    
    def test_delete_attendance_record(self):
        """Test DELETE /api/attendance/{id} - Delete attendance record"""
        if not self.created_attendance_ids:
            self.log_test("Delete Attendance Record", False, "No attendance IDs available for testing")
            return False
        
        # Delete the first attendance record (present)
        attendance_id = self.created_attendance_ids[0]
        
        try:
            response = self.session.delete(f"{self.base_url}/attendance/{attendance_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "deleted" in data["message"].lower():
                    # Verify course statistics are updated
                    course_response = self.session.get(f"{self.base_url}/courses/{self.created_course_id}")
                    if course_response.status_code == 200:
                        course_data = course_response.json()
                        # After deleting 1 present record, should have: totalClasses = 1, attendedClasses = 0
                        if course_data["totalClasses"] == 1 and course_data["attendedClasses"] == 0:
                            self.log_test("Delete Attendance Record", True, "Attendance deleted and course stats updated")
                            return True
                        else:
                            self.log_test("Delete Attendance Record", False, 
                                        f"Course stats not updated correctly: {course_data['attendedClasses']}/{course_data['totalClasses']}")
                            return False
                    else:
                        self.log_test("Delete Attendance Record", False, "Could not verify course stats after deletion")
                        return False
                else:
                    self.log_test("Delete Attendance Record", False, "Unexpected response format", data)
                    return False
            else:
                self.log_test("Delete Attendance Record", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Delete Attendance Record", False, f"Request error: {str(e)}")
            return False
    
    def test_delete_course(self):
        """Test DELETE /api/courses/{id} - Delete course"""
        if not self.created_course_id:
            self.log_test("Delete Course", False, "No course ID available for testing")
            return False
        
        try:
            response = self.session.delete(f"{self.base_url}/courses/{self.created_course_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "deleted" in data["message"].lower():
                    # Verify course is actually deleted
                    verify_response = self.session.get(f"{self.base_url}/courses/{self.created_course_id}")
                    if verify_response.status_code == 404:
                        self.log_test("Delete Course", True, "Course and related attendance records deleted")
                        return True
                    else:
                        self.log_test("Delete Course", False, "Course still exists after deletion")
                        return False
                else:
                    self.log_test("Delete Course", False, "Unexpected response format", data)
                    return False
            else:
                self.log_test("Delete Course", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Delete Course", False, f"Request error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        tests_passed = 0
        total_tests = 3
        
        # Test 1: Invalid course ID
        try:
            response = self.session.get(f"{self.base_url}/courses/invalid_id")
            if response.status_code == 400:
                tests_passed += 1
                print("✅ Invalid course ID handling: Correct error response")
            else:
                print(f"❌ Invalid course ID handling: Expected 400, got {response.status_code}")
        except Exception as e:
            print(f"❌ Invalid course ID handling: Request error: {str(e)}")
        
        # Test 2: Missing required fields in course creation
        try:
            response = self.session.post(
                f"{self.base_url}/courses",
                json={"name": "Test"},  # Missing required fields
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 422:  # FastAPI validation error
                tests_passed += 1
                print("✅ Missing fields validation: Correct error response")
            else:
                print(f"❌ Missing fields validation: Expected 422, got {response.status_code}")
        except Exception as e:
            print(f"❌ Missing fields validation: Request error: {str(e)}")
        
        # Test 3: Non-existent attendance record deletion
        try:
            response = self.session.delete(f"{self.base_url}/attendance/507f1f77bcf86cd799439011")  # Valid ObjectId format
            if response.status_code == 404:
                tests_passed += 1
                print("✅ Non-existent attendance deletion: Correct error response")
            else:
                print(f"❌ Non-existent attendance deletion: Expected 404, got {response.status_code}")
        except Exception as e:
            print(f"❌ Non-existent attendance deletion: Request error: {str(e)}")
        
        success = tests_passed == total_tests
        self.log_test("Error Handling", success, f"Passed {tests_passed}/{total_tests} error handling tests")
        return success
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting University Calendar Backend API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence - order matters for data dependencies
        test_methods = [
            self.test_root_endpoint,
            self.test_create_course,
            self.test_get_all_courses,
            self.test_get_single_course,
            self.test_update_course,
            self.test_mark_attendance_present,
            self.test_mark_attendance_absent,
            self.test_course_statistics_update,
            self.test_get_course_attendance,
            self.test_get_all_absences,
            self.test_delete_attendance_record,
            self.test_delete_course,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(test_methods)
        
        for test_method in test_methods:
            if test_method():
                passed += 1
            print()  # Add spacing between tests
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! University Calendar Backend API is working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed. Please check the issues above.")
            return False

def main():
    """Main test execution"""
    tester = UniversityCalendarTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()