import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.resource import Resource
from app.middleware.auth import get_current_user
from app.services.ai_service import summarize_pdf, analyze_pyq, study_assistant
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str
    context_resource_id: Optional[int] = None


@router.post("/summarize")
async def summarize_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    file_path = os.path.join(settings.UPLOAD_DIR, resource.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    if not resource.file_name.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files can be summarized")

    result = summarize_pdf(file_path)
    return result


@router.post("/analyze-pyq")
async def analyze_pyq_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    file_path = os.path.join(settings.UPLOAD_DIR, resource.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    if not resource.file_name.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files can be analyzed")

    result = analyze_pyq(file_path)
    return result


@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    context = ""
    if request.context_resource_id:
        resource = db.query(Resource).filter(Resource.id == request.context_resource_id).first()
        if resource and resource.file_name.lower().endswith('.pdf'):
            file_path = os.path.join(settings.UPLOAD_DIR, resource.file_path)
            if os.path.exists(file_path):
                from PyPDF2 import PdfReader
                try:
                    reader = PdfReader(file_path)
                    for page in reader.pages[:10]:
                        context += page.extract_text() or ""
                except:
                    pass

    result = study_assistant(request.message, context)
    return result


@router.get("/status")
def ai_status():
    return {
        "configured": bool(settings.GEMINI_API_KEY),
        "model": "gemini-2.0-flash" if settings.GEMINI_API_KEY else None,
    }
