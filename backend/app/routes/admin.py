import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func, extract
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.user import User
from app.models.resource import Resource
from app.models.download import Download
from app.models.report import Report
from app.models.rating import Rating
from app.models.bookmark import Bookmark
from app.middleware.auth import get_admin_user
from app.schemas.user import UserResponse, UserAdminUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
def get_dashboard(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(sql_func.count(User.id)).scalar()
    total_resources = db.query(sql_func.count(Resource.id)).scalar()
    total_downloads = db.query(sql_func.count(Download.id)).scalar()
    total_reports = db.query(sql_func.count(Report.id)).filter(Report.status == "pending").scalar()
    total_bookmarks = db.query(sql_func.count(Bookmark.id)).scalar()
    total_ratings = db.query(sql_func.count(Rating.id)).scalar()

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    monthly_uploads = db.query(sql_func.count(Resource.id)).filter(Resource.created_at >= thirty_days_ago).scalar()
    monthly_downloads = db.query(sql_func.count(Download.id)).filter(Download.created_at >= thirty_days_ago).scalar()
    weekly_uploads = db.query(sql_func.count(Resource.id)).filter(Resource.created_at >= seven_days_ago).scalar()
    weekly_users = db.query(sql_func.count(User.id)).filter(User.created_at >= seven_days_ago).scalar()

    top_resources = db.query(Resource).filter(Resource.status == "approved").order_by(Resource.download_count.desc()).limit(10).all()
    recent_uploads = db.query(Resource).order_by(Resource.created_at.desc()).limit(10).all()

    uploads_by_type = db.query(Resource.resource_type, sql_func.count(Resource.id)).filter(Resource.status == "approved").group_by(Resource.resource_type).all()
    uploads_by_semester = db.query(Resource.semester, sql_func.count(Resource.id)).filter(Resource.status == "approved", Resource.semester.isnot(None)).group_by(Resource.semester).order_by(Resource.semester).all()

    monthly_data = []
    for i in range(5, -1, -1):
        month_start = datetime.utcnow().replace(day=1) - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)
        count = db.query(sql_func.count(Resource.id)).filter(Resource.created_at >= month_start, Resource.created_at < month_end).scalar()
        monthly_data.append({"month": month_start.strftime("%b %Y"), "uploads": count})

    top_uploaders = db.query(User.full_name, sql_func.count(Resource.id)).join(Resource, User.id == Resource.uploader_id).group_by(User.full_name).order_by(sql_func.count(Resource.id).desc()).limit(5).all()

    return {
        "total_users": total_users,
        "total_resources": total_resources,
        "total_downloads": total_downloads,
        "total_reports": total_reports,
        "total_bookmarks": total_bookmarks,
        "total_ratings": total_ratings,
        "monthly_uploads": monthly_uploads,
        "monthly_downloads": monthly_downloads,
        "weekly_uploads": weekly_uploads,
        "weekly_users": weekly_users,
        "top_resources": [{"id": r.id, "title": r.title, "downloads": r.download_count, "rating_avg": r.rating_avg} for r in top_resources],
        "recent_uploads": [{"id": r.id, "title": r.title, "resource_type": r.resource_type, "created_at": r.created_at} for r in recent_uploads],
        "uploads_by_type": [{"type": t, "count": c} for t, c in uploads_by_type],
        "uploads_by_semester": [{"semester": s, "count": c} for s, c in uploads_by_semester],
        "monthly_data": monthly_data,
        "top_uploaders": [{"name": n, "uploads": c} for n, c in top_uploaders],
    }


@router.get("/users")
def list_users(
    page: int = 1,
    per_page: int = 20,
    search: str = "",
    role: str = "",
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%") | User.full_name.ilike(f"%{search}%"))
    if role:
        query = query.filter(User.role == role)
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "users": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "total_pages": math.ceil(total / per_page),
    }


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    update_data: UserAdminUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    return {"message": "User updated"}


@router.get("/resources")
def list_all_resources(
    page: int = 1,
    per_page: int = 20,
    status: str = "",
    resource_type: str = "",
    search: str = "",
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(Resource)
    if status:
        query = query.filter(Resource.status == status)
    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    if search:
        query = query.filter(Resource.title.ilike(f"%{search}%"))
    total = query.count()
    resources = query.order_by(Resource.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "resources": [{"id": r.id, "title": r.title, "status": r.status, "resource_type": r.resource_type, "file_name": r.file_name, "download_count": r.download_count, "uploader_id": r.uploader_id, "created_at": r.created_at} for r in resources],
        "total": total,
        "page": page,
        "total_pages": math.ceil(total / per_page),
    }


@router.put("/resources/{resource_id}/approve")
def approve_resource(
    resource_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.status = "approved"
    db.commit()
    return {"message": "Resource approved"}


@router.put("/resources/{resource_id}/reject")
def reject_resource(
    resource_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.status = "rejected"
    db.commit()
    return {"message": "Resource rejected"}


@router.delete("/resources/{resource_id}")
def delete_resource(
    resource_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted"}


@router.get("/reports")
def list_reports(
    page: int = 1,
    per_page: int = 20,
    status: str = "",
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)
    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "reports": [{"id": r.id, "reason": r.reason, "description": r.description, "status": r.status, "resource_id": r.resource_id, "user_id": r.user_id, "created_at": r.created_at} for r in reports],
        "total": total,
        "page": page,
        "total_pages": math.ceil(total / per_page),
    }


@router.put("/reports/{report_id}/resolve")
def resolve_report(
    report_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "resolved"
    report.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Report resolved"}


@router.put("/reports/{report_id}/dismiss")
def dismiss_report(
    report_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "dismissed"
    report.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Report dismissed"}
