import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.resource import Resource
from app.models.bookmark import Bookmark
from app.schemas.user import UserResponse, UserUpdate
from app.middleware.auth import get_current_user
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/me/uploads")
def get_my_uploads(
    page: int = 1,
    per_page: int = 12,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Resource).filter(Resource.uploader_id == current_user.id)
    total = query.count()
    resources = query.order_by(Resource.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "resources": [{"id": r.id, "title": r.title, "file_name": r.file_name, "status": r.status, "download_count": r.download_count, "created_at": r.created_at} for r in resources],
        "total": total,
    }


@router.get("/me/bookmarks")
def get_my_bookmarks(
    page: int = 1,
    per_page: int = 12,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Bookmark).filter(Bookmark.user_id == current_user.id)
    total = query.count()
    bookmarks = query.order_by(Bookmark.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "bookmarks": [{"id": b.id, "resource_id": b.resource_id, "created_at": b.created_at} for b in bookmarks],
        "total": total,
    }


@router.post("/me/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed = ["image/jpeg", "image/png", "image/webp"]
    if avatar.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP images allowed")

    content = await avatar.read()
    if len(content) > 5242880:
        raise HTTPException(status_code=400, detail="Avatar must be under 5MB")

    os.makedirs(os.path.join(settings.UPLOAD_DIR, "avatars"), exist_ok=True)
    ext = avatar.filename.rsplit(".", 1)[1].lower() if "." in avatar.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, "avatars", filename)

    with open(filepath, "wb") as f:
        f.write(content)

    if current_user.avatar_url:
        old_path = os.path.join(settings.UPLOAD_DIR, "avatars", current_user.avatar_url.split("/")[-1])
        if os.path.exists(old_path):
            os.remove(old_path)

    current_user.avatar_url = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(current_user)

    return {"avatar_url": current_user.avatar_url}
