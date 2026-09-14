# LU Academic Vault

A centralized student-driven academic resource platform for Lucknow University students to upload, organize, search, preview, and download study materials.

## Problem Statement

Lucknow University students struggle to find study materials like lecture notes, previous year question papers (PYQs), assignments, and syllabus documents. Resources are scattered across different groups, drives, and platforms, making it difficult to access everything in one place.

## Solution

LU Academic Vault provides a single platform where students can:
- Upload and share study materials
- Search for resources by subject, department, semester
- Access Previous Year Question Papers (PYQs)
- Preview PDFs directly in the browser
- Get AI-powered summaries and study assistance
- Bookmark useful resources for quick access

## Features

### Core Features
- **User Authentication** - JWT-based auth with email verification and password reset
- **Resource Upload** - Upload PDFs, DOCs, PPTs with validation and duplicate detection
- **Smart Search** - Full-text search with relevance scoring and autocomplete
- **PYQ Library** - Dedicated section with filters by department, course, semester, subject
- **Bookmark System** - Save and organize favorite resources
- **Rating System** - Rate resources 1-5 stars with helpful votes
- **Download Tracking** - Track download counts and popular resources
- **PDF Preview** - Preview PDFs directly in the browser

### Admin Features
- **Dashboard** - Charts and analytics (uploads, downloads, users)
- **User Management** - Ban/unban users, change roles
- **Resource Moderation** - Approve, reject, or delete resources
- **Department Management** - Manage departments, courses, subjects
- **Report System** - Review and resolve user reports

### AI Features (Google Gemini)
- **PDF Summarizer** - AI-generated summaries of study materials
- **PYQ Analyzer** - Analyze exam patterns and important topics
- **Study Assistant** - Chatbot for academic questions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens) |
| AI | Google Gemini API |
| Charts | Recharts |

## Architecture

```
lu-academic-vault/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth context
│   │   ├── services/      # API calls
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/     # Auth middleware
│   ├── uploads/           # Uploaded files
│   └── requirements.txt
│
└── README.md
```

## Database Schema

13 tables with proper relationships:
- Users, Departments, Courses, Semesters, Subjects
- Resources, Tags, Bookmarks, Downloads, Ratings, Reports

## API Documentation

### Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Resource Endpoints
- `GET /api/resources` - List resources with filters
- `POST /api/resources` - Upload resource
- `GET /api/resources/{id}` - Get resource details
- `PUT /api/resources/{id}` - Update resource
- `DELETE /api/resources/{id}` - Delete resource
- `POST /api/resources/{id}/bookmark` - Toggle bookmark
- `POST /api/resources/{id}/rate` - Rate resource
- `POST /api/resources/{id}/download` - Record download

### Search Endpoints
- `GET /api/search?q=...` - Search with filters
- `GET /api/search/suggestions` - Search suggestions

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/resources` - List all resources
- `GET /api/admin/reports` - List reports

### AI Endpoints
- `POST /api/ai/summarize` - Summarize PDF
- `POST /api/ai/analyze-pyq` - Analyze question paper
- `POST /api/ai/chat` - Study assistant

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your env vars
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Database Setup

```bash
# Create database
createdb lu_academic_vault

# Tables are created automatically on first run
# Sample data is seeded automatically
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/lu_academic_vault
SECRET_KEY=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
GEMINI_API_KEY=your-gemini-api-key
```

## Running Locally

### Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173

## Default Admin Account

- **Email:** admin@lu.ac.in
- **Password:** admin123

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Render/Railway)
```bash
# Set environment variables
# Deploy to Render or Railway
```

## Future Improvements

- [ ] Elasticsearch for advanced search
- [ ] Vector database for AI-powered recommendations
- [ ] Email notifications for new resources
- [ ] Resource versioning
- [ ] Collaborative playlists
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built for Lucknow University students
- Powered by Google Gemini AI
- UI inspired by modern SaaS platforms
