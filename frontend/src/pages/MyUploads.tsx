import { useState, useEffect } from 'react';
import { users } from '../services/api';
import { Link } from 'react-router-dom';
import type { Resource } from '../types';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', project: 'Project', other: 'Other' };

export default function MyUploads() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [uploadResources, setUploadResources] = useState<Map<number, Resource>>(new Map());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    users.getMyUploads().then(async d => {
      setUploads(d.resources);
      setTotal(d.total);
      const resourceMap = new Map<number, Resource>();
      await Promise.all(d.resources.map(async (r: any) => {
        try {
          const res = await fetch(`/api/resources/${r.id}`).then(r => r.json());
          resourceMap.set(r.id, res);
        } catch {}
      }));
      setUploadResources(resourceMap);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Uploads ({total})</h1>
        <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Upload New</Link>
      </div>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : uploads.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500 mb-4">You haven't uploaded anything yet.</p><Link to="/upload" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload Now</Link></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploads.map((u: any) => {
            const r = uploadResources.get(u.id);
            return (
              <Link key={u.id} to={`/resource/${u.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${u.status === 'approved' ? 'bg-green-100 text-green-700' : u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span>
                  {r && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{typeLabels[r.resource_type] || r.resource_type}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r?.title || u.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <span>⬇ {r?.download_count || u.download_count}</span>
                  <span>👁 {r?.view_count || 0}</span>
                  <span>⭐ {r?.rating_avg?.toFixed(1) || '0.0'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
