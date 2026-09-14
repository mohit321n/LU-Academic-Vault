import { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { Link } from 'react-router-dom';

export default function Reports() {
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (p = page, s = status) => {
    setLoading(true);
    admin.getReports(p).then(d => { setReportsList(d.reports); setTotal(d.total); setTotalPages(d.total_pages); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(1, status); }, [status]);

  const handleResolve = async (id: number) => { await admin.resolveReport(id); load(); };

  const reasonLabels: Record<string, string> = {
    incorrect: 'Incorrect Material', duplicate: 'Duplicate', spam: 'Spam',
    copyright: 'Copyright Issue', inappropriate: 'Inappropriate', wrong_category: 'Wrong Category',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total reports</p>
        </div>
        <Link to="/admin" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Back to Dashboard</Link>
      </div>

      <div className="flex gap-2 mb-6">
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Status</option><option value="pending">Pending</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : reportsList.length === 0 ? (
        <div className="text-center py-12"><div className="text-5xl mb-4">✅</div><p className="text-gray-500">No reports found.</p></div>
      ) : (
        <div className="space-y-3">
          {reportsList.map((r: any) => (
            <div key={r.id} className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${r.status === 'resolved' ? 'bg-green-100 text-green-700' : r.status === 'dismissed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{reasonLabels[r.reason] || r.reason}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <span>Report #{r.id}</span>
                    <Link to={`/resource/${r.resource_id}`} className="text-blue-600 hover:text-blue-700">Resource #{r.resource_id}</Link>
                    <span>User #{r.user_id}</span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.description && <p className="text-sm text-gray-600 mt-2">{r.description}</p>}
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleResolve(r.id)} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Resolve</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && <button onClick={() => { setPage(page - 1); load(page - 1); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Prev</button>}
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
          {page < totalPages && <button onClick={() => { setPage(page + 1); load(page + 1); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Next</button>}
        </div>
      )}
    </div>
  );
}
