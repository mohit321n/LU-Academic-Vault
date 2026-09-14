export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  department?: string;
  course?: string;
  semester?: number;
  roll_number?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Resource {
  id: number;
  title: string;
  description?: string;
  resource_type: string;
  file_name: string;
  file_size: number;
  status: string;
  download_count: number;
  bookmark_count: number;
  rating_avg: number;
  rating_count: number;
  view_count: number;
  is_pyq: boolean;
  pyq_year?: number;
  semester?: number;
  academic_year?: string;
  exam_type?: string;
  university?: string;
  uploader_id: number;
  subject_id?: number;
  department_id?: number;
  course_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  department_id: number;
  duration_years: number;
  total_semesters: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  course_id: number;
  semester_number: number;
  description?: string;
}

export interface PaginatedResponse<T> {
  resources: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  department?: string;
  course?: string;
  semester?: number;
  roll_number?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface DashboardStats {
  total_users: number;
  total_resources: number;
  total_downloads: number;
  total_reports: number;
  monthly_uploads: number;
  monthly_downloads: number;
  top_resources: { id: number; title: string; downloads: number }[];
  recent_uploads: { id: number; title: string; created_at: string }[];
  uploads_by_type: Record<string, number>;
}
