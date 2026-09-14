from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    resource_type: str
    subject_id: Optional[int] = None
    department_id: Optional[int] = None
    course_id: Optional[int] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None
    exam_type: Optional[str] = None
    university: Optional[str] = None
    is_pyq: bool = False
    pyq_year: Optional[int] = None
    tags: Optional[List[str]] = []


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    subject_id: Optional[int] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None


class ResourceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    resource_type: str
    file_name: str
    file_size: int
    status: str
    download_count: int
    bookmark_count: int
    rating_avg: float
    rating_count: int
    view_count: int
    is_pyq: bool
    pyq_year: Optional[int] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None
    exam_type: Optional[str] = None
    university: Optional[str] = None
    uploader_id: int
    subject_id: Optional[int] = None
    department_id: Optional[int] = None
    course_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResourceListResponse(BaseModel):
    resources: List[ResourceResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class RatingCreate(BaseModel):
    stars: int
    helpful: Optional[bool] = None


class ReportCreate(BaseModel):
    reason: str
    description: Optional[str] = None
