from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base
from app.models.tag import resource_tags
import enum


class ResourceType(str, enum.Enum):
    NOTES = "notes"
    PYQ = "pyq"
    ASSIGNMENT = "assignment"
    PRACTICAL = "practical"
    SYLLABUS = "syllabus"
    BOOK = "book"
    LAB_MANUAL = "lab_manual"
    PROJECT = "project"
    OTHER = "other"


class ResourceStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(String(50), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_hash = Column(String(64), nullable=True)

    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)

    semester = Column(Integer, nullable=True)
    academic_year = Column(String(20), nullable=True)
    exam_type = Column(String(100), nullable=True)
    university = Column(String(255), nullable=True)

    status = Column(String(20), default=ResourceStatus.APPROVED)
    download_count = Column(Integer, default=0)
    bookmark_count = Column(Integer, default=0)
    rating_avg = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    is_pyq = Column(Boolean, default=False)
    pyq_year = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    uploader = relationship("User", back_populates="resources")
    subject = relationship("Subject", back_populates="resources")
    tags = relationship("Tag", secondary=resource_tags, back_populates="resources")
    bookmarks = relationship("Bookmark", back_populates="resource", cascade="all, delete-orphan")
    downloads = relationship("Download", back_populates="resource", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="resource", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="resource", cascade="all, delete-orphan")
