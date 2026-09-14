from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    name: str
    code: str
    department_id: int
    duration_years: int = 4
    total_semesters: int = 8


class CourseResponse(BaseModel):
    id: int
    name: str
    code: str
    department_id: int
    duration_years: int
    total_semesters: int
    created_at: datetime

    class Config:
        from_attributes = True


class SubjectCreate(BaseModel):
    name: str
    code: str
    course_id: int
    semester_number: int
    description: Optional[str] = None


class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str
    course_id: int
    semester_number: int
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SemesterResponse(BaseModel):
    id: int
    number: int
    name: str

    class Config:
        from_attributes = True
