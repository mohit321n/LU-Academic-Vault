import os
import math
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
from typing import Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.resource import Resource, ResourceStatus
from app.models.bookmark import Bookmark
from app.models.download import Download
from app.models.rating import Rating
from app.models.report import Report
from app.models.tag import Tag, resource_tags
from app.schemas.resource import (
    ResourceCreate, ResourceUpdate, ResourceResponse,
    ResourceListResponse, RatingCreate, ReportCreate,
)
from app.middleware.auth import get_current_user
from app.utils.file_utils import allowed_file, get_file_hash, format_file_size
from app.config import get_settings
import uuid

settings = get_settings()
router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("", response_model=ResourceListResponse)
def list_resources(
    page: int = 1,
    per_page: int = 12,
    resource_type: Optional[str] = None,
    department_id: Optional[int] = None,
    course_id: Optional[int] = None,
    semester: Optional[int] = None,
    subject_id: Optional[int] = None,
    is_pyq: Optional[bool] = None,
    sort: str = "newest",
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Resource).filter(Resource.status == ResourceStatus.APPROVED)

    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    if department_id:
        query = query.filter(Resource.department_id == department_id)
    if course_id:
        query = query.filter(Resource.course_id == course_id)
    if semester:
        query = query.filter(Resource.semester == semester)
    if subject_id:
        query = query.filter(Resource.subject_id == subject_id)
    if is_pyq is not None:
        query = query.filter(Resource.is_pyq == is_pyq)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Resource.title.ilike(search_term) | Resource.description.ilike(search_term)
        )

    total = query.count()

    if sort == "newest":
        query = query.order_by(Resource.created_at.desc())
    elif sort == "popular":
        query = query.order_by(Resource.download_count.desc())
    elif sort == "rating":
        query = query.order_by(Resource.rating_avg.desc())
    elif sort == "most_bookmarked":
        query = query.order_by(Resource.bookmark_count.desc())

    resources = query.offset((page - 1) * per_page).limit(per_page).all()

    return ResourceListResponse(
        resources=[ResourceResponse.model_validate(r) for r in resources],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page),
    )


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    resource.view_count += 1
    db.commit()

    return ResourceResponse.model_validate(resource)


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def upload_resource(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    resource_type: str = Form(...),
    subject_id: Optional[int] = Form(None),
    department_id: Optional[int] = Form(None),
    course_id: Optional[int] = Form(None),
    semester: Optional[int] = Form(None),
    academic_year: Optional[str] = Form(None),
    exam_type: Optional[str] = Form(None),
    university: Optional[str] = Form(None),
    is_pyq: bool = Form(False),
    pyq_year: Optional[int] = Form(None),
    tags: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    file_content = await file.read()
    if len(file_content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 50MB allowed.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(file_content)

    file_hash = get_file_hash(file_path)

    existing = db.query(Resource).filter(Resource.file_hash == file_hash).first()
    if existing:
        os.remove(file_path)
        raise HTTPException(
            status_code=409,
            detail="A similar resource already exists",
        )

    resource = Resource(
        title=title,
        description=description,
        resource_type=resource_type,
        file_path=unique_filename,
        file_name=file.filename,
        file_size=len(file_content),
        file_hash=file_hash,
        uploader_id=current_user.id,
        subject_id=subject_id,
        department_id=department_id,
        course_id=course_id,
        semester=semester,
        academic_year=academic_year,
        exam_type=exam_type,
        university=university,
        is_pyq=is_pyq,
        pyq_year=pyq_year,
    )
    db.add(resource)
    db.flush()

    if tags:
        for tag_name in tags.split(","):
            tag_name = tag_name.strip()
            if tag_name:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()
                resource.tags.append(tag)

    db.commit()
    db.refresh(resource)
    return ResourceResponse.model_validate(resource)


@router.post("/{resource_id}/bookmark")
def toggle_bookmark(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    existing = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.resource_id == resource_id,
    ).first()

    if existing:
        db.delete(existing)
        resource.bookmark_count = max(0, resource.bookmark_count - 1)
        db.commit()
        return {"bookmarked": False}
    else:
        bookmark = Bookmark(user_id=current_user.id, resource_id=resource_id)
        db.add(bookmark)
        resource.bookmark_count += 1
        db.commit()
        return {"bookmarked": True}


@router.post("/{resource_id}/rate", response_model=dict)
def rate_resource(
    resource_id: int,
    rating_data: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if rating_data.stars < 1 or rating_data.stars > 5:
        raise HTTPException(status_code=400, detail="Stars must be 1-5")

    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    existing = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.resource_id == resource_id,
    ).first()

    if existing:
        existing.stars = rating_data.stars
        existing.helpful = rating_data.helpful
    else:
        rating = Rating(
            user_id=current_user.id,
            resource_id=resource_id,
            stars=rating_data.stars,
            helpful=rating_data.helpful,
        )
        db.add(rating)
        resource.rating_count += 1

    avg = db.query(sql_func.avg(Rating.stars)).filter(Rating.resource_id == resource_id).scalar()
    resource.rating_avg = round(float(avg or 0), 2)
    db.commit()

    return {"rating_avg": resource.rating_avg, "rating_count": resource.rating_count}


@router.post("/{resource_id}/download")
def record_download(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    download = Download(user_id=current_user.id, resource_id=resource_id)
    db.add(download)
    resource.download_count += 1
    db.commit()

    return {"download_url": f"/api/files/{resource.file_path}"}


@router.post("/{resource_id}/report")
def report_resource(
    resource_id: int,
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    report = Report(
        user_id=current_user.id,
        resource_id=resource_id,
        reason=report_data.reason,
        description=report_data.description,
    )
    db.add(report)
    db.commit()
    return {"message": "Report submitted successfully"}


@router.get("/{resource_id}/bookmarked")
def check_bookmarked(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bookmarked = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.resource_id == resource_id,
    ).first()
    return {"bookmarked": bookmarked is not None}
