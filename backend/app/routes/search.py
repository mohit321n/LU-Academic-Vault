import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, case
from typing import Optional
from app.database.connection import get_db
from app.models.resource import Resource, ResourceStatus
from app.models.tag import Tag, resource_tags

router = APIRouter(prefix="/api/search", tags=["search"])


def calculate_relevance(resource, search_term):
    score = 0
    title_lower = resource.title.lower()
    desc_lower = (resource.description or '').lower()
    search_lower = search_term.lower()

    if search_lower in title_lower:
        score += 10
        if title_lower.startswith(search_lower):
            score += 5
    if search_lower in desc_lower:
        score += 3
    if search_lower in resource.file_name.lower():
        score += 2
    score += resource.download_count * 0.1
    score += resource.rating_avg * 2
    score += resource.view_count * 0.05
    return score


@router.get("")
def search_resources(
    q: str = Query(..., min_length=1),
    resource_type: Optional[str] = None,
    department_id: Optional[int] = None,
    course_id: Optional[int] = None,
    semester: Optional[int] = None,
    subject_id: Optional[int] = None,
    academic_year: Optional[str] = None,
    is_pyq: Optional[bool] = None,
    pyq_year: Optional[int] = None,
    min_rating: Optional[float] = None,
    sort: str = "relevance",
    page: int = 1,
    per_page: int = 12,
    db: Session = Depends(get_db),
):
    query = db.query(Resource).filter(Resource.status == ResourceStatus.APPROVED)

    search_terms = q.lower().split()
    conditions = []
    for term in search_terms:
        term_pattern = f"%{term}%"
        conditions.append(Resource.title.ilike(term_pattern))
        conditions.append(Resource.description.ilike(term_pattern))
        conditions.append(Resource.file_name.ilike(term_pattern))
    query = query.filter(or_(*conditions))

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
    if academic_year:
        query = query.filter(Resource.academic_year == academic_year)
    if is_pyq is not None:
        query = query.filter(Resource.is_pyq == is_pyq)
    if pyq_year:
        query = query.filter(Resource.pyq_year == pyq_year)
    if min_rating:
        query = query.filter(Resource.rating_avg >= min_rating)

    total = query.count()

    if sort == "relevance":
        all_resources = query.all()
        all_resources.sort(key=lambda r: calculate_relevance(r, q), reverse=True)
        resources = all_resources[(page - 1) * per_page:page * per_page]
    elif sort == "newest":
        query = query.order_by(Resource.created_at.desc())
        resources = query.offset((page - 1) * per_page).limit(per_page).all()
    elif sort == "popular":
        query = query.order_by(Resource.download_count.desc())
        resources = query.offset((page - 1) * per_page).limit(per_page).all()
    elif sort == "rating":
        query = query.order_by(Resource.rating_avg.desc())
        resources = query.offset((page - 1) * per_page).limit(per_page).all()
    elif sort == "most_bookmarked":
        query = query.order_by(Resource.bookmark_count.desc())
        resources = query.offset((page - 1) * per_page).limit(per_page).all()
    else:
        resources = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "resources": [{"id": r.id, "title": r.title, "description": r.description, "resource_type": r.resource_type, "file_name": r.file_name, "file_size": r.file_size, "download_count": r.download_count, "rating_avg": r.rating_avg, "rating_count": r.rating_count, "bookmark_count": r.bookmark_count, "view_count": r.view_count, "semester": r.semester, "academic_year": r.academic_year, "is_pyq": r.is_pyq, "pyq_year": r.pyq_year, "created_at": r.created_at} for r in resources],
        "total": total,
        "query": q,
        "page": page,
        "per_page": per_page,
        "total_pages": math.ceil(total / per_page),
    }


@router.get("/suggestions")
def get_search_suggestions(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    term = f"%{q}%"
    resources = db.query(Resource.title).filter(
        Resource.status == ResourceStatus.APPROVED,
        Resource.title.ilike(term)
    ).limit(10).all()

    suggestions = list(set([r[0] for r in resources]))
    return {"suggestions": suggestions[:8]}
