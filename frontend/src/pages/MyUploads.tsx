import { useState, useEffect } from 'react';
import { users } from '../services/api';
import { Link } from 'react-router-dom';

export default function MyUploads() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { users.getMyUploads().then(d => { setUploads(d.resources); setTotal(d.total); }).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Uploads ({total})</h1>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : uploads.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500 mb-4">You haven't uploaded anything yet.</p><Link to="/upload" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload Now</Link></div>
      ) : (
        <div className="space-y-3">
          {uploads.map((u: any) => (
            <Link key={u.id} to={`/resource/${u.id}`} className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div><div className="font-semibold text-gray-900">{u.title}</div><div className="text-sm text-gray-500 mt-1">{u.file_name}</div></div>
                <div className="text-right"><span className={`px-2 py-1 text-xs rounded-full ${u.status === 'approved' ? 'bg-green-100 text-green-700' : u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span><div className="text-xs text-gray-500 mt-1">⬇ {u.download_count}</div></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
