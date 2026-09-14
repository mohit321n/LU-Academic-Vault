# LU Academic Vault - Project Plan

## Project Overview
LU Academic Vault is a centralized student-driven academic resource platform for Lucknow University students to upload, organize, search, preview, and download study materials.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Python 3.11+ + FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL 15+ |
| Auth | JWT (access + refresh tokens) |
| File Storage | Local `/uploads` directory |
| AI | Google Gemini API (free tier) |
| Search | PostgreSQL full-text search |
| Charts | Recharts (admin analytics) |
| PDF Viewer | react-pdf / pdf.js |

---

## Database Schema

### Tables (13)

1. **users** - User accounts (students + admins)
2. **departments** - University departments (Engineering, Commerce, etc.)
3. **courses** - Programs (B.Tech, BCA, MCA, B.Com, etc.)
4. **semesters** - Semester numbers (1-8)
5. **subjects** - Subjects per course/semester
6. **resources** - Uploaded study materials
7. **tags** - Resource tags for search
8. **resource_tags** - Many-to-many: resources ↔ tags
9. **bookmarks** - User bookmarks
10. **downloads** - Download tracking
11. **ratings** - Resource ratings (1-5 stars + helpful)
12. **reports** - Reported resources
13. **comments** - Resource comments/reviews

### Relationships
```
users ──1:many──> resources
departments ──1:many──> courses
courses ──1:many──> subjects
subjects ──1:many──> resources
users ──1:many──> bookmarks ──many:1──> resources
users ──1:many──> downloads ──many:1──> resources
users ──1:many──> ratings ──many:1──> resources
users ──1:many──> reports ──many:1──> resources
tags ──many:many──> resources (via resource_tags)
```

---

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me

### Users
- GET /api/users/{id}
- PUT /api/users/{id}
- GET /api/users/{id}/uploads
- GET /api/users/{id}/bookmarks

### Resources
- GET /api/resources (with filters, pagination)
- POST /api/resources (upload)
- GET /api/resources/{id}
- PUT /api/resources/{id}
- DELETE /api/resources/{id}
- POST /api/resources/{id}/bookmark
- DELETE /api/resources/{id}/bookmark
- POST /api/resources/{id}/rate
- POST /api/resources/{id}/download
- POST /api/resources/{id}/report
- GET /api/resources/{id}/similar

### Search
- GET /api/search?q=...&department=...&semester=...&type=...

### PYQs
- GET /api/pyqs?department=...&course=...&semester=...&subject=...&year=...

### Academic Hierarchy
- GET /api/departments
- POST /api/departments (admin)
- GET /api/departments/{id}/courses
- GET /api/courses/{id}/subjects
- POST /api/subjects (admin)

### Admin
- GET /api/admin/dashboard (analytics)
- GET /api/admin/users
- PUT /api/admin/users/{id}/ban
- GET /api/admin/resources
- PUT /api/admin/resources/{id}/approve
- DELETE /api/admin/resources/{id}
- GET /api/admin/reports
- PUT /api/admin/reports/{id}/resolve

### AI
- POST /api/ai/summarize (PDF summarization)
- POST /api/ai/analyze-pyq (PYQ analysis)
- POST /api/ai/search (natural language search)
- POST /api/ai/chat (study assistant)

---

## Frontend Pages (20)

1. Home - Hero, search, popular resources, browse by dept/semester
2. Login - Email/password login
3. Register - Student registration
4. Dashboard - User's personalized dashboard
5. Browse Resources - Filterable resource list
6. Resource Details - Full resource view with preview
7. Upload Resource - Multi-step upload form
8. PYQ Library - Dedicated PYQ section
9. Subject Page - Resources for a subject
10. Department Page - Department overview
11. Semester Page - Semester overview
12. Bookmarks - User's saved resources
13. My Uploads - User's uploaded resources
14. Profile - User profile management
15. Search Results - Search with filters
16. Admin Dashboard - Analytics & stats
17. Manage Users - Admin user management
18. Manage Resources - Admin resource moderation
19. Reports - Admin report review
20. About - About page

---

## Phases

### Phase 1: Project Setup & Architecture
- Initialize frontend (React + Vite + TypeScript + Tailwind)
- Initialize backend (FastAPI + SQLAlchemy + Alembic)
- Create database schema (all 13 tables)
- Set up folder structure
- Environment configuration (.env)
- CORS setup
- Basic health check endpoint

### Phase 2: Authentication & User System
- User registration with validation
- Login with JWT tokens
- Password hashing (bcrypt)
- Auth middleware (FastAPI dependency)
- Auth context (React)
- Protected routes
- User profile page
- Login/Register pages

### Phase 3: Resource Management
- Department/Course/Subject CRUD (admin APIs)
- Resource upload with file handling
- File validation (type, size)
- Resource listing with filters
- Resource detail page
- Upload page (multi-step form)
- Browse page
- Dashboard
- Sample data for Lucknow University

### Phase 4: Core Features
- Full-text search with PostgreSQL
- Bookmark system (add/remove/view)
- Rating system (1-5 stars + helpful)
- Download tracking
PYQ dedicated section
- Resource preview (PDF viewer)
- Duplicate detection
- Report system

### Phase 5: Admin Panel
- Admin dashboard with charts (Recharts)
- User management
- Resource moderation (approve/reject)
- Department/Subject management
- Reports review
- Analytics

### Phase 6: AI Features
- PDF summarization (Google Gemini)
- PYQ topic analysis
- Natural language search
- Study assistant chatbot (RAG)

### Phase 7: Polish & Production
- Performance optimization
- Responsive UI polish
- Error handling
- README.md
- Deployment config

---

## Project Structure

```
lu-academic-vault/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              (Button, Input, Modal, etc.)
│   │   │   ├── layout/          (Navbar, Sidebar, Footer)
│   │   │   ├── resource/        (ResourceCard, ResourceList)
│   │   │   ├── auth/            (LoginForm, RegisterForm)
│   │   │   └── admin/           (AdminSidebar, StatsCard)
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Browse.tsx
│   │   │   ├── ResourceDetail.tsx
│   │   │   ├── Upload.tsx
│   │   │   ├── PYQLibrary.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── Bookmarks.tsx
│   │   │   ├── MyUploads.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── ManageUsers.tsx
│   │   │       ├── ManageResources.tsx
│   │   │       └── Reports.tsx
│   │   ├── hooks/
│   │   ├── services/            (API calls)
│   │   ├── context/             (AuthContext)
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── resource.py
│   │   │   ├── department.py
│   │   │   ├── course.py
│   │   │   ├── subject.py
│   │   │   ├── bookmark.py
│   │   │   ├── download.py
│   │   │   ├── rating.py
│   │   │   ├── report.py
│   │   │   └── tag.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── resource.py
│   │   │   ├── auth.py
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── resources.py
│   │   │   ├── search.py
│   │   │   ├── pyqs.py
│   │   │   ├── admin.py
│   │   │   └── ai.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── resource_service.py
│   │   │   ├── search_service.py
│   │   │   └── ai_service.py
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── seed.py
│   │   ├── middleware/
│   │   │   └── auth.py
│   │   └── utils/
│   │       ├── file_utils.py
│   │       └── hash_utils.py
│   ├── uploads/
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## Sample Data

### Departments
- Engineering & Technology
- Computer Applications
- Commerce
- Science
- Arts & Humanities

### Courses
- B.Tech CSE
- B.Tech CSE (AI & ML)
- B.Tech CSE (Data Science)
- BCA
- MCA
- B.Com
- B.Sc (Computer Science)
- BA (Computer Applications)

### Subjects (Engineering - CSE)
- Data Structures & Algorithms
- Database Management Systems
- Operating Systems
- Computer Networks
- Compiler Design
- Design & Analysis of Algorithms
- Machine Learning
- Artificial Intelligence
- Software Engineering
- Web Technologies

### Resource Types
- Lecture Notes
- Previous Year Question Papers (PYQ)
- Assignments
- Practical Files
- Syllabus
- Books & References
- Lab Manuals
- Projects
- Other
