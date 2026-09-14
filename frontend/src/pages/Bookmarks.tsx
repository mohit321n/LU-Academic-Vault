import { useState, useEffect } from 'react';
import { users } from '../services/api';
import { Link } from 'react-router-dom';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { users.getMyBookmarks().then(d => { setBookmarks(d.bookmarks); setTotal(d.total); }).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookmarks ({total})</h1>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : bookmarks.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500 mb-4">No bookmarks yet.</p><Link to="/browse" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Browse Resources</Link></div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b: any) => (
            <Link key={b.id} to={`/resource/${b.resource_id}`} className="block p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
              <div className="font-semibold text-gray-900">Resource #{b.resource_id}</div>
              <div className="text-xs text-gray-500 mt-1">Bookmarked on {new Date(b.created_at).toLocaleDateString()}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
