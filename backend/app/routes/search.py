from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.resource import Resource, ResourceStatus

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("")
def search_resources(
    q: str = Query(..., min_length=1),
    resource_type: Optional[str] = None,
    department_id: Optional[int] = None,
    semester: Optional[int] = None,
    academic_year: Optional[str] = None,
    sort: str = "relevance",
    page: int = 1,
    per_page: int = 12,
    db: Session = Depends(get_db),
):
    query = db.query(Resource).filter(Resource.status == ResourceStatus.APPROVED)

    search_term = f"%{q}%"
    query = query.filter(
        Resource.title.ilike(search_term)
        | Resource.description.ilike(search_term)
        | Resource.file_name.ilike(search_term)
    )

    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    if department_id:
        query = query.filter(Resource.department_id == department_id)
    if semester:
        query = query.filter(Resource.semester == semester)
    if academic_year:
        query = query.filter(Resource.academic_year == academic_year)

    total = query.count()

    if sort == "newest":
        query = query.order_by(Resource.created_at.desc())
    elif sort == "popular":
        query = query.order_by(Resource.download_count.desc())
    elif sort == "rating":
        query = query.order_by(Resource.rating_avg.desc())

    resources = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "resources": [{"id": r.id, "title": r.title, "resource_type": r.resource_type, "file_name": r.file_name, "download_count": r.download_count, "rating_avg": r.rating_avg, "semester": r.semester, "created_at": r.created_at} for r in resources],
        "total": total,
        "query": q,
        "page": page,
        "per_page": per_page,
    }
