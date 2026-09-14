import { useState, useEffect } from 'react';
import { admin } from '../../services/api';

export default function ManageResources() {
  const [resourcesList, setResourcesList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (page = 1) => {
    setLoading(true);
    admin.getResources(page, status).then(d => { setResourcesList(d.resources); setTotal(d.total); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Resources ({total})</h1>
      <div className="flex gap-2 mb-6">
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="space-y-3">
          {resourcesList.map((r: any) => (
            <div key={r.id} className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{r.title}</div>
                <div className="text-xs text-gray-500 mt-1">{r.file_name} | {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                {r.status !== 'approved' && <button onClick={() => { admin.approveResource(r.id).then(load); }} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Approve</button>}
                {r.status !== 'rejected' && <button onClick={() => { admin.rejectResource(r.id).then(load); }} className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">Reject</button>}
                <button onClick={() => { if (confirm('Delete this resource?')) admin.deleteResource(r.id).then(load); }} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
