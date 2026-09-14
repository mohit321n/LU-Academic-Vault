import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resources as resourcesApi, departments as deptApi } from '../services/api';
import type { Resource, Department } from '../types';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', project: 'Project', other: 'Other' };
const typeColors: Record<string, string> = { notes: 'bg-blue-100 text-blue-700', pyq: 'bg-orange-100 text-orange-700', assignment: 'bg-green-100 text-green-700', practical: 'bg-purple-100 text-purple-700', syllabus: 'bg-pink-100 text-pink-700', book: 'bg-yellow-100 text-yellow-700', lab_manual: 'bg-indigo-100 text-indigo-700', project: 'bg-red-100 text-red-700', other: 'bg-gray-100 text-gray-700' };

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resourcesList, setResourcesList] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
      is_pyq: searchParams.get('is_pyq') === 'true' ? true : undefined,
    };
    resourcesApi.list(params).then(d => { setResourcesList(d.resources); setTotal(d.total); setTotalPages(d.total_pages); }).finally(() => setLoading(false));
  }, [searchParams]);

  const setPage = (p: number) => { searchParams.set('page', String(p)); setSearchParams(searchParams); };
  const setFilter = (key: string, value: string) => {
    searchParams.set(key, value);
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Resources</h1>
          <p className="text-gray-500 text-sm mt-1">{total} resources available</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={searchParams.get('type') || ''} onChange={e => setFilter('type', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={searchParams.get('department_id') || ''} onChange={e => setFilter('department_id', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={searchParams.get('semester') || ''} onChange={e => setFilter('semester', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select value={searchParams.get('is_pyq') || ''} onChange={e => setFilter('is_pyq', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Resources</option>
          <option value="true">PYQs Only</option>
        </select>
        <select value={searchParams.get('sort') || 'newest'} onChange={e => setFilter('sort', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="newest">Newest</option>
          <option value="popular">Most Downloaded</option>
          <option value="rating">Highest Rated</option>
          <option value="most_bookmarked">Most Bookmarked</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="p-4 bg-white rounded-xl border border-gray-200 animate-pulse"><div className="h-4 bg-gray-200 rounded w-20 mb-3"></div><div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 rounded w-full mb-4"></div><div className="flex gap-4"><div className="h-3 bg-gray-200 rounded w-12"></div><div className="h-3 bg-gray-200 rounded w-12"></div></div></div>)}
        </div>
      ) : resourcesList.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-500 text-lg mb-2">No resources found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourcesList.map(r => (
              <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition group">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[r.resource_type] || 'bg-gray-100 text-gray-700'}`}>{typeLabels[r.resource_type] || r.resource_type}</span>
                  {r.is_pyq && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">PYQ {r.pyq_year}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">{r.title}</h3>
                {r.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{r.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">⬇ {r.download_count}</span>
                  <span className="flex items-center gap-1">⭐ {r.rating_avg.toFixed(1)}</span>
                  <span className="flex items-center gap-1">👁 {r.view_count}</span>
                  {r.semester && <span>Sem {r.semester}</span>}
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && <button onClick={() => setPage(page - 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Prev</button>}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-4 py-2 border rounded-lg text-sm ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>{p}</button>
              ))}
              {page < totalPages && <button onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Next</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
