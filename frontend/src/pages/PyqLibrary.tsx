import { useState, useEffect } from 'react';
import { resources as resourcesApi } from '../services/api';
import { Link } from 'react-router-dom';
import type { Resource } from '../types';

export default function PYQLibrary() {
  const [pyqs, setPyqs] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { is_pyq: true, per_page: 24 };
    if (semester) params.semester = Number(semester);
    if (subject) params.search = subject;
    resourcesApi.list(params).then(d => setPyqs(d.resources)).finally(() => setLoading(false));
  }, [semester, subject]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PYQ Library</h1>
      <p className="text-gray-500 mb-6">Previous Year Question Papers for Lucknow University</p>
      <div className="flex gap-3 mb-6">
        <select value={semester} onChange={e => setSemester(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Semesters</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Search by subject..." className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : pyqs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No PYQs found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pyqs.map(r => (
            <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">PYQ</span>
                {r.pyq_year && <span className="text-xs text-gray-500">{r.pyq_year}</span>}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                <span>⬇ {r.download_count}</span>
                <span>Sem {r.semester || '-'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
