import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { search as searchApi } from '../services/api';
import { Link } from 'react-router-dom';
import type { Resource } from '../types';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', other: 'Other' };

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchApi.search({ q: query }).then(d => { setResults(d.resources); setTotal(d.total); }).finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
      <p className="text-gray-500 mb-6">{total} results for "{query}"</p>
      {loading ? <div className="text-center py-12 text-gray-500">Searching...</div> : results.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No results found. Try different keywords.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(r => (
            <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{typeLabels[r.resource_type] || r.resource_type}</span>
              <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">{r.title}</h3>
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
