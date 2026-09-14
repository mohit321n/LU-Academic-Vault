import { useState, useEffect } from 'react';
import { resources as resourcesApi, departments as deptApi } from '../services/api';
import { Link } from 'react-router-dom';
import type { Resource, Department, Course, Subject } from '../types';

export default function PyqLibrary() {
  const [pyqs, setPyqs] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filters, setFilters] = useState({ department_id: '', course_id: '', semester: '', subject_id: '', pyq_year: '', sort: 'newest' });

  useEffect(() => { deptApi.list().then(setDepartments); }, []);
  useEffect(() => { if (filters.department_id) deptApi.getCourses(Number(filters.department_id)).then(setCourses); }, [filters.department_id]);
  useEffect(() => { if (filters.course_id) deptApi.getSubjects(Number(filters.course_id)).then(setSubjects); }, [filters.course_id]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { is_pyq: true, per_page: 24, sort: filters.sort };
    if (filters.department_id) params.department_id = Number(filters.department_id);
    if (filters.course_id) params.course_id = Number(filters.course_id);
    if (filters.semester) params.semester = Number(filters.semester);
    if (filters.subject_id) params.subject_id = Number(filters.subject_id);
    if (filters.pyq_year) params.search = filters.pyq_year;
    resourcesApi.list(params).then(d => { setPyqs(d.resources); setTotal(d.total); }).finally(() => setLoading(false));
  }, [filters]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'department_id') { updated.course_id = ''; updated.subject_id = ''; }
      if (key === 'course_id') { updated.subject_id = ''; }
      return updated;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PYQ Library</h1>
        <p className="text-gray-500">Previous Year Question Papers for Lucknow University</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select value={filters.department_id} onChange={e => updateFilter('department_id', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filters.course_id} onChange={e => updateFilter('course_id', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Courses</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.semester} onChange={e => updateFilter('semester', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Semesters</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <select value={filters.subject_id} onChange={e => updateFilter('subject_id', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Subjects</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.pyq_year} onChange={e => updateFilter('pyq_year', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Years</option>{[2024,2023,2022,2021,2020].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="newest">Newest</option><option value="popular">Most Downloaded</option><option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} PYQs found</p>

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : pyqs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No PYQs found with current filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pyqs.map(r => (
            <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">PYQ</span>
                {r.pyq_year && <span className="text-xs text-gray-500 font-medium">{r.pyq_year}</span>}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h3>
              {r.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{r.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                <span>⬇ {r.download_count}</span>
                <span>⭐ {r.rating_avg.toFixed(1)}</span>
                <span>Sem {r.semester || '-'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
