import { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { Link } from 'react-router-dom';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', project: 'Project', other: 'Other' };

export default function ManageResources() {
  const [resourcesList, setResourcesList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), per_page: '20' });
    if (status) params.set('status', status);
    if (resourceType) params.set('resource_type', resourceType);
    if (search) params.set('search', search);
    fetch(`/api/admin/resources?${params}`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
      .then(r => r.json())
      .then(d => { setResourcesList(d.resources); setTotal(d.total); setTotalPages(d.total_pages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); setPage(1); }, [status, resourceType]);

  const handleApprove = async (id: number) => { await admin.approveResource(id); load(); };
  const handleReject = async (id: number) => { await admin.rejectResource(id); load(); };
  const handleDelete = async (id: number) => { if (confirm('Delete this resource?')) { await admin.deleteResource(id); load(); } };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Resources</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total resources</p>
        </div>
        <Link to="/admin" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Back to Dashboard</Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
        <select value={resourceType} onChange={e => setResourceType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button onClick={() => load(1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Search</button>
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : resourcesList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No resources found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Downloads</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resourcesList.map((r: any) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><Link to={`/resource/${r.id}`} className="font-medium text-gray-900 hover:text-blue-600 truncate block max-w-xs">{r.title}</Link></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{typeLabels[r.resource_type] || r.resource_type}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full font-medium ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-gray-500">{r.download_count}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {r.status !== 'approved' && <button onClick={() => handleApprove(r.id)} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Approve</button>}
                      {r.status !== 'rejected' && <button onClick={() => handleReject(r.id)} className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">Reject</button>}
                      <button onClick={() => handleDelete(r.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && <button onClick={() => { setPage(page - 1); load(page - 1); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Prev</button>}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); load(p); }} className={`px-4 py-2 border rounded-lg text-sm ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>{p}</button>
          ))}
          {page < totalPages && <button onClick={() => { setPage(page + 1); load(page + 1); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Next</button>}
        </div>
      )}
    </div>
  );
}
