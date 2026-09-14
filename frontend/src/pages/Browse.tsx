import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resources as resourcesApi, departments as deptApi } from '../services/api';
import type { Resource, Department } from '../types';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', project: 'Project', other: 'Other' };

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resourcesList, setResourcesList] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => { deptApi.list().then(setDepartments); }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | undefined> = {
      page,
      per_page: 12,
      sort: searchParams.get('sort') || 'newest',
      resource_type: searchParams.get('type') || undefined,
      department_id: searchParams.get('department_id') ? Number(searchParams.get('department_id')) : undefined,
      semester: searchParams.get('semester') ? Number(searchParams.get('semester')) : undefined,
    };
    resourcesApi.list(params).then(d => { setResourcesList(d.resources); setTotal(d.total); }).finally(() => setLoading(false));
  }, [searchParams]);

  const setPage = (p: number) => { searchParams.set('page', String(p)); setSearchParams(searchParams); };
  const setFilter = (key: string, value: string) => { searchParams.set(key, value); searchParams.delete('page'); setSearchParams(searchParams); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Resources</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={searchParams.get('type') || ''} onChange={e => setFilter('type', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={searchParams.get('department_id') || ''} onChange={e => setFilter('department_id', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={searchParams.get('semester') || ''} onChange={e => setFilter('semester', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select value={searchParams.get('sort') || 'newest'} onChange={e => setFilter('sort', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="newest">Newest</option>
          <option value="popular">Most Downloaded</option>
          <option value="rating">Highest Rated</option>
          <option value="most_bookmarked">Most Bookmarked</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : resourcesList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No resources found.</div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} resources found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourcesList.map(r => (
              <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{typeLabels[r.resource_type] || r.resource_type}</span>
                  {r.is_pyq && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">PYQ {r.pyq_year}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <span>⬇ {r.download_count}</span>
                  <span>⭐ {r.rating_avg.toFixed(1)}</span>
                  <span>Sem {r.semester || '-'}</span>
                </div>
              </Link>
            ))}
          </div>
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && <button onClick={() => setPage(page - 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Prev</button>}
              <span className="px-4 py-2 text-sm text-gray-600">Page {page}</span>
              {resourcesList.length === 12 && <button onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Next</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
