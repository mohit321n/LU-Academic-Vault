from app.models.user import User
from app.models.department import Department
from app.models.course import Course
from app.models.semester import Semester
from app.models.subject import Subject
from app.models.resource import Resource
from app.models.tag import Tag, resource_tags
from app.models.bookmark import Bookmark
from app.models.download import Download
from app.models.rating import Rating
from app.models.report import Report

__all__ = [
    "User", "Department", "Course", "Semester", "Subject",
    "Resource", "Tag", "resource_tags", "Bookmark", "Download",
    "Rating", "Report"
]
