import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { search as searchApi, departments as deptApi } from '../services/api';
import type { Resource, Department } from '../types';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', other: 'Other' };

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(query);
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => { deptApi.list().then(setDepartments); }, []);

  useEffect(() => {
    if (query) {
      setLoading(true);
      const params: Record<string, any> = {
        q: query,
        page,
        per_page: 12,
        sort: searchParams.get('sort') || 'relevance',
        resource_type: searchParams.get('type') || undefined,
        department_id: searchParams.get('department_id') ? Number(searchParams.get('department_id')) : undefined,
        semester: searchParams.get('semester') ? Number(searchParams.get('semester')) : undefined,
        is_pyq: searchParams.get('is_pyq') === 'true' ? true : undefined,
        min_rating: searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined,
      };
      searchApi.search(params).then(d => { setResults(d.resources); setTotal(d.total); setTotalPages(d.total_pages); }).finally(() => setLoading(false));
    }
  }, [query, searchParams]);

  useEffect(() => {
    if (searchInput.length >= 2) {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(searchInput)}`).then(r => r.json()).then(d => setSuggestions(d.suggestions || [])).catch(() => {});
    } else { setSuggestions([]); }
  }, [searchInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) { searchParams.set('q', searchInput); setSearchParams(searchParams); }
  };

  const setFilter = (key: string, value: string) => { searchParams.set(key, value); searchParams.delete('page'); setSearchParams(searchParams); };
  const setPage = (p: number) => { searchParams.set('page', String(p)); setSearchParams(searchParams); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search by subject, paper code, topic..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10">
              {suggestions.map((s, i) => (
                <button key={i} type="button" onClick={() => { setSearchInput(s); searchParams.set('q', s); setSearchParams(searchParams); setSuggestions([]); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{s}</button>
              ))}
            </div>
          )}
        </div>
      </form>

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
        <select value={searchParams.get('is_pyq') || ''} onChange={e => setFilter('is_pyq', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Resources</option>
          <option value="true">PYQs Only</option>
        </select>
        <select value={searchParams.get('min_rating') || ''} onChange={e => setFilter('min_rating', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>
        <select value={searchParams.get('sort') || 'relevance'} onChange={e => setFilter('sort', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="popular">Most Downloaded</option>
          <option value="rating">Highest Rated</option>
          <option value="most_bookmarked">Most Bookmarked</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">Searching...</div> : results.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500 text-lg mb-2">No results found for "{query}"</p><p className="text-gray-400 text-sm">Try different keywords or adjust filters</p></div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} results found for "{query}"</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(r => (
              <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{typeLabels[r.resource_type] || r.resource_type}</span>
                  {r.is_pyq && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">PYQ {r.pyq_year}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h3>
                {r.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{r.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <span>⬇ {r.download_count}</span>
                  <span>⭐ {r.rating_avg.toFixed(1)}</span>
                  <span>👁 {r.view_count}</span>
                  <span>Sem {r.semester || '-'}</span>
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && <button onClick={() => setPage(page - 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Prev</button>}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-4 py-2 border rounded-lg text-sm ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>{p}</button>
              ))}
              {page < totalPages && <button onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Next</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
