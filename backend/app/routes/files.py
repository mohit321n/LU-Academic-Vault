import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.resource import Resource
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/{filename}")
def serve_file(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


@router.get("/preview/{filename}")
def preview_file(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    ext = filename.rsplit(".", 1)[-1].lower()
    media_types = {
        "pdf": "application/pdf",
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
    }
    media_type = media_types.get(ext, "application/octet-stream")
    return FileResponse(file_path, media_type=media_type, headers={"Content-Disposition": f'inline; filename="{filename}"'})


@router.get("/avatar/{filename}")
def serve_avatar(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, "avatars", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Avatar not found")
    return FileResponse(file_path)
