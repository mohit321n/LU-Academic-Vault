import type { User, Resource, Department, Course, Subject, PaginatedResponse, LoginRequest, RegisterRequest, TokenResponse, DashboardStats } from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return res.json();
}

export const auth = {
  login: (data: LoginRequest) => request<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: RegisterRequest) => request<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<User>('/auth/me'),
  refresh: (refresh_token: string) => request<TokenResponse>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),
};

export const resources = {
  list: (params: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.set(k, String(v)); });
    return request<PaginatedResponse<Resource>>(`/resources?${query}`);
  },
  get: (id: number) => request<Resource>(`/resources/${id}`),
  upload: (formData: FormData) => {
    const token = localStorage.getItem('access_token');
    return fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(r => r.json());
  },
  bookmark: (id: number) => request<{ bookmarked: boolean }>(`/resources/${id}/bookmark`, { method: 'POST' }),
  rate: (id: number, stars: number, helpful?: boolean) => request<{ rating_avg: number; rating_count: number }>(`/resources/${id}/rate`, { method: 'POST', body: JSON.stringify({ stars, helpful }) }),
  download: (id: number) => request<{ download_url: string }>(`/resources/${id}/download`, { method: 'POST' }),
  report: (id: number, reason: string, description?: string) => request<{ message: string }>(`/resources/${id}/report`, { method: 'POST', body: JSON.stringify({ reason, description }) }),
  checkBookmarked: (id: number) => request<{ bookmarked: boolean }>(`/resources/${id}/bookmarked`),
};

export const departments = {
  list: () => request<Department[]>('/departments'),
  getCourses: (deptId: number) => request<Course[]>(`/departments/${deptId}/courses`),
  getSubjects: (courseId: number, semester?: number) => {
    const query = semester ? `?semester=${semester}` : '';
    return request<Subject[]>(`/courses/${courseId}/subjects${query}`);
  },
};

export const search = {
  search: (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.set(k, String(v)); });
    return request<PaginatedResponse<Resource>>(`/search?${query}`);
  },
};

export const users = {
  getMe: () => request<User>('/users/me'),
  updateMe: (data: Partial<User>) => request<User>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getMyUploads: (page = 1) => request<{ resources: any[]; total: number }>(`/users/me/uploads?page=${page}`),
  getMyBookmarks: (page = 1) => request<{ bookmarks: any[]; total: number }>(`/users/me/bookmarks?page=${page}`),
};

export const admin = {
  getDashboard: () => request<DashboardStats>('/admin/dashboard'),
  getUsers: (page = 1, search = '') => request<{ users: User[]; total: number }>(`/admin/users?page=${page}&search=${search}`),
  updateUser: (id: number, data: { is_active?: boolean; role?: string }) => request<{ message: string }>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getResources: (page = 1, status = '') => request<{ resources: any[]; total: number }>(`/admin/resources?page=${page}&status=${status}`),
  approveResource: (id: number) => request<{ message: string }>(`/admin/resources/${id}/approve`, { method: 'PUT' }),
  rejectResource: (id: number) => request<{ message: string }>(`/admin/resources/${id}/reject`, { method: 'PUT' }),
  deleteResource: (id: number) => request<{ message: string }>(`/admin/resources/${id}`, { method: 'DELETE' }),
  getReports: (page = 1) => request<{ reports: any[]; total: number }>(`/admin/reports?page=${page}`),
  resolveReport: (id: number) => request<{ message: string }>(`/admin/reports/${id}/resolve`, { method: 'PUT' }),
};
