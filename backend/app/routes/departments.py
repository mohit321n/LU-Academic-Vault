from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.department import Department
from app.models.course import Course
from app.models.subject import Subject
from app.schemas.department import DepartmentCreate, DepartmentResponse, CourseCreate, CourseResponse, SubjectCreate, SubjectResponse
from app.middleware.auth import get_admin_user
from app.models.user import User

router = APIRouter(prefix="/api", tags=["departments"])


@router.get("/departments", response_model=list[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


@router.post("/departments", response_model=DepartmentResponse, status_code=201)
def create_department(
    data: DepartmentCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Department).filter(Department.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department code already exists")
    dept = Department(**data.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("/departments/{dept_id}/courses", response_model=list[CourseResponse])
def list_courses(dept_id: int, db: Session = Depends(get_db)):
    return db.query(Course).filter(Course.department_id == dept_id).all()


@router.post("/courses", response_model=CourseResponse, status_code=201)
def create_course(
    data: CourseCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    course = Course(**data.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/courses/{course_id}/subjects", response_model=list[SubjectResponse])
def list_subjects(course_id: int, semester: int = None, db: Session = Depends(get_db)):
    query = db.query(Subject).filter(Subject.course_id == course_id)
    if semester:
        query = query.filter(Subject.semester_number == semester)
    return query.all()


@router.post("/subjects", response_model=SubjectResponse, status_code=201)
def create_subject(
    data: SubjectCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    subject = Subject(**data.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject
