from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.course import Course
from app.models.subject import Subject
from app.models.semester import Semester
from app.models.user import User
from app.utils.security import hash_password


def seed_database(db: Session):
    existing = db.query(Department).first()
    if existing:
        return

    departments = [
        Department(name="Engineering & Technology", code="ENG", description="Engineering and Technology programs"),
        Department(name="Computer Applications", code="CA", description="Computer Applications programs"),
        Department(name="Commerce", code="COM", description="Commerce programs"),
        Department(name="Science", code="SCI", description="Science programs"),
        Department(name="Arts & Humanities", code="ART", description="Arts and Humanities programs"),
    ]
    db.add_all(departments)
    db.flush()

    courses = [
        Course(name="B.Tech Computer Science", code="BTech_CSE", department_id=departments[0].id, duration_years=4, total_semesters=8),
        Course(name="B.Tech CSE (AI & ML)", code="BTech_CSE_AI", department_id=departments[0].id, duration_years=4, total_semesters=8),
        Course(name="B.Tech CSE (Data Science)", code="BTech_CSE_DS", department_id=departments[0].id, duration_years=4, total_semesters=8),
        Course(name="BCA", code="BCA", department_id=departments[1].id, duration_years=3, total_semesters=6),
        Course(name="MCA", code="MCA", department_id=departments[1].id, duration_years=2, total_semesters=4),
        Course(name="B.Com", code="BCom", department_id=departments[2].id, duration_years=3, total_semesters=6),
        Course(name="B.Sc Computer Science", code="BSc_CS", department_id=departments[3].id, duration_years=3, total_semesters=6),
        Course(name="BA Computer Applications", code="BA_CA", department_id=departments[4].id, duration_years=3, total_semesters=6),
    ]
    db.add_all(courses)
    db.flush()

    subjects = [
        Subject(name="Data Structures & Algorithms", code="CS101", course_id=courses[0].id, semester_number=3),
        Subject(name="Database Management Systems", code="CS201", course_id=courses[0].id, semester_number=4),
        Subject(name="Operating Systems", code="CS301", course_id=courses[0].id, semester_number=5),
        Subject(name="Computer Networks", code="CS401", course_id=courses[0].id, semester_number=5),
        Subject(name="Compiler Design", code="CS501", course_id=courses[0].id, semester_number=6),
        Subject(name="Design & Analysis of Algorithms", code="CS601", course_id=courses[0].id, semester_number=4),
        Subject(name="Machine Learning", code="CS701", course_id=courses[0].id, semester_number=7),
        Subject(name="Artificial Intelligence", code="CS801", course_id=courses[0].id, semester_number=7),
        Subject(name="Software Engineering", code="CS901", course_id=courses[0].id, semester_number=6),
        Subject(name="Web Technologies", code="CS1001", course_id=courses[0].id, semester_number=6),
        Subject(name="Introduction to Programming", code="AI101", course_id=courses[1].id, semester_number=1),
        Subject(name="AI Fundamentals", code="AI201", course_id=courses[1].id, semester_number=3),
        Subject(name="Deep Learning", code="AI301", course_id=courses[1].id, semester_number=5),
        Subject(name="Natural Language Processing", code="AI401", course_id=courses[1].id, semester_number=6),
        Subject(name="Data Mining", code="DS101", course_id=courses[2].id, semester_number=3),
        Subject(name="Big Data Analytics", code="DS201", course_id=courses[2].id, semester_number=5),
        Subject(name="Fundamentals of Computing", code="BCA101", course_id=courses[3].id, semester_number=1),
        Subject(name="Programming in C", code="BCA201", course_id=courses[3].id, semester_number=2),
        Subject(name="Object Oriented Programming", code="BCA301", course_id=courses[3].id, semester_number=3),
        Subject(name="Web Development", code="BCA401", course_id=courses[3].id, semester_number=4),
    ]
    db.add_all(subjects)
    db.flush()

    for i in range(1, 9):
        sem = Semester(number=i, name=f"Semester {i}")
        db.add(sem)

    admin = User(
        email="admin@lu.ac.in",
        full_name="Admin",
        hashed_password=hash_password("admin123"),
        role="admin",
        is_active=True,
        is_verified=True,
    )
    db.add(admin)

    db.commit()
    print("Database seeded successfully!")
