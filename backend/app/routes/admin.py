from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.user import User
from app.models.resource import Resource
from app.models.download import Download
from app.models.report import Report
from app.middleware.auth import get_admin_user
from app.schemas.user import UserResponse, UserAdminUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
def get_dashboard(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(sql_func.count(User.id)).scalar()
    total_resources = db.query(sql_func.count(Resource.id)).scalar()
    total_downloads = db.query(sql_func.count(Download.id)).scalar()
    total_reports = db.query(sql_func.count(Report.id)).filter(Report.status == "pending").scalar()

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_uploads = db.query(sql_func.count(Resource.id)).filter(Resource.created_at >= thirty_days_ago).scalar()
    monthly_downloads = db.query(sql_func.count(Download.id)).filter(Download.created_at >= thirty_days_ago).scalar()

    top_resources = db.query(Resource).order_by(Resource.download_count.desc()).limit(10).all()

    recent_uploads = db.query(Resource).order_by(Resource.created_at.desc()).limit(10).all()

    uploads_by_type = db.query(
        Resource.resource_type, sql_func.count(Resource.id)
    ).group_by(Resource.resource_type).all()

    return {
        "total_users": total_users,
        "total_resources": total_resources,
        "total_downloads": total_downloads,
        "total_reports": total_reports,
        "monthly_uploads": monthly_uploads,
        "monthly_downloads": monthly_downloads,
        "top_resources": [{"id": r.id, "title": r.title, "downloads": r.download_count} for r in top_resources],
        "recent_uploads": [{"id": r.id, "title": r.title, "created_at": r.created_at} for r in recent_uploads],
        "uploads_by_type": {t: c for t, c in uploads_by_type},
    }


@router.get("/users")
def list_users(
    page: int = 1,
    per_page: int = 20,
    search: str = "",
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%") | User.full_name.ilike(f"%{search}%"))
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()
    return {
        "users": [UserResponse.model_validate(u) for u in users],
        "total": total,
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
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(Resource)
    if status:
        query = query.filter(Resource.status == status)
    total = query.count()
    resources = query.order_by(Resource.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "resources": [{"id": r.id, "title": r.title, "status": r.status, "file_name": r.file_name, "created_at": r.created_at} for r in resources],
        "total": total,
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
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    total = db.query(Report).count()
    reports = db.query(Report).order_by(Report.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "reports": [{"id": r.id, "reason": r.reason, "status": r.status, "resource_id": r.resource_id, "created_at": r.created_at} for r in reports],
        "total": total,
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
