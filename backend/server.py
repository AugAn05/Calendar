from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper function to convert ObjectId to string
def course_helper(course) -> dict:
    return {
        "id": str(course["_id"]),
        "name": course["name"],
        "type": course["type"],
        "schedule": course["schedule"],
        "minAttendancePercentage": course["minAttendancePercentage"],
        "totalClasses": course["totalClasses"],
        "attendedClasses": course["attendedClasses"],
        "color": course.get("color", "#4A90E2"),
        "totalClassesInSemester": course.get("totalClassesInSemester"),
        "createdAt": course.get("createdAt", datetime.utcnow().isoformat())
    }

def attendance_helper(attendance) -> dict:
    return {
        "id": str(attendance["_id"]),
        "courseId": str(attendance["courseId"]),
        "date": attendance["date"],
        "status": attendance["status"],
        "notes": attendance.get("notes", "")
    }

# Define Models
class ScheduleSlot(BaseModel):
    day: str  # Monday, Tuesday, etc.
    startTime: str  # HH:MM format
    endTime: str  # HH:MM format

class CourseCreate(BaseModel):
    name: str
    type: str  # "course" or "seminar"
    schedule: List[ScheduleSlot]
    minAttendancePercentage: float
    color: Optional[str] = "#4A90E2"
    totalClassesInSemester: Optional[int] = None  # Optional: total classes expected in semester

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    schedule: Optional[List[ScheduleSlot]] = None
    minAttendancePercentage: Optional[float] = None
    color: Optional[str] = None

class AttendanceCreate(BaseModel):
    courseId: str
    date: str  # ISO date string
    status: str  # "present" or "absent"
    notes: Optional[str] = ""

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

# Course endpoints
@api_router.post("/courses")
async def create_course(course: CourseCreate):
    course_dict = course.dict()
    course_dict["totalClasses"] = 0
    course_dict["attendedClasses"] = 0
    course_dict["createdAt"] = datetime.utcnow().isoformat()
    
    result = await db.courses.insert_one(course_dict)
    new_course = await db.courses.find_one({"_id": result.inserted_id})
    return course_helper(new_course)

@api_router.get("/courses")
async def get_courses():
    courses = await db.courses.find().to_list(1000)
    return [course_helper(course) for course in courses]

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    try:
        course = await db.courses.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return course_helper(course)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.put("/courses/{course_id}")
async def update_course(course_id: str, course_update: CourseUpdate):
    try:
        update_data = {k: v for k, v in course_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        result = await db.courses.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        
        updated_course = await db.courses.find_one({"_id": ObjectId(course_id)})
        return course_helper(updated_course)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    try:
        # Delete all attendance records for this course
        await db.attendance.delete_many({"courseId": ObjectId(course_id)})
        
        # Delete the course
        result = await db.courses.delete_one({"_id": ObjectId(course_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return {"message": "Course deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Attendance endpoints
@api_router.post("/attendance")
async def create_attendance(attendance: AttendanceCreate):
    try:
        # Check if attendance already exists for this course and date
        existing = await db.attendance.find_one({
            "courseId": ObjectId(attendance.courseId),
            "date": attendance.date
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Attendance already marked for this date")
        
        attendance_dict = attendance.dict()
        attendance_dict["courseId"] = ObjectId(attendance.courseId)
        
        result = await db.attendance.insert_one(attendance_dict)
        
        # Update course statistics
        update_query = {"$inc": {"totalClasses": 1}}
        if attendance.status == "present":
            update_query["$inc"]["attendedClasses"] = 1
        
        await db.courses.update_one(
            {"_id": ObjectId(attendance.courseId)},
            update_query
        )
        
        new_attendance = await db.attendance.find_one({"_id": result.inserted_id})
        return attendance_helper(new_attendance)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/attendance/course/{course_id}")
async def get_course_attendance(course_id: str):
    try:
        attendance_records = await db.attendance.find(
            {"courseId": ObjectId(course_id)}
        ).sort("date", -1).to_list(1000)
        return [attendance_helper(record) for record in attendance_records]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/attendance/absences")
async def get_all_absences():
    try:
        # Get all absence records
        absences = await db.attendance.find(
            {"status": "absent"}
        ).sort("date", -1).to_list(1000)
        
        # Enrich with course information
        result = []
        for absence in absences:
            course = await db.courses.find_one({"_id": absence["courseId"]})
            if course:
                absence_data = attendance_helper(absence)
                absence_data["courseName"] = course["name"]
                absence_data["courseColor"] = course.get("color", "#4A90E2")
                result.append(absence_data)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.put("/attendance/{attendance_id}")
async def update_attendance(attendance_id: str, attendance_update: AttendanceUpdate):
    try:
        # Get current attendance record
        current = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
        if not current:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        
        old_status = current["status"]
        new_status = attendance_update.status if attendance_update.status else old_status
        
        # Update attendance record
        update_data = {k: v for k, v in attendance_update.dict().items() if v is not None}
        await db.attendance.update_one(
            {"_id": ObjectId(attendance_id)},
            {"$set": update_data}
        )
        
        # Update course statistics if status changed
        if attendance_update.status and old_status != new_status:
            if new_status == "present" and old_status == "absent":
                await db.courses.update_one(
                    {"_id": current["courseId"]},
                    {"$inc": {"attendedClasses": 1}}
                )
            elif new_status == "absent" and old_status == "present":
                await db.courses.update_one(
                    {"_id": current["courseId"]},
                    {"$inc": {"attendedClasses": -1}}
                )
        
        updated_attendance = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
        return attendance_helper(updated_attendance)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/attendance/{attendance_id}")
async def delete_attendance(attendance_id: str):
    try:
        # Get the attendance record first
        attendance = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
        if not attendance:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        
        # Update course statistics
        update_query = {"$inc": {"totalClasses": -1}}
        if attendance["status"] == "present":
            update_query["$inc"]["attendedClasses"] = -1
        
        await db.courses.update_one(
            {"_id": attendance["courseId"]},
            update_query
        )
        
        # Delete the attendance record
        await db.attendance.delete_one({"_id": ObjectId(attendance_id)})
        
        return {"message": "Attendance record deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/")
async def root():
    return {"message": "University Calendar API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
