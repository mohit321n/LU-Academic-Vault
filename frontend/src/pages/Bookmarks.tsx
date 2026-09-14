import { useState, useEffect } from 'react';
import { users } from '../services/api';
import { resources as resourcesApi } from '../services/api';
import { Link } from 'react-router-dom';
import type { Resource } from '../types';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [bookmarkResources, setBookmarkResources] = useState<Map<number, Resource>>(new Map());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    users.getMyBookmarks().then(async d => {
      setBookmarks(d.bookmarks);
      setTotal(d.total);
      const resourceIds = d.bookmarks.map((b: any) => b.resource_id);
      const resourceMap = new Map<number, Resource>();
      await Promise.all(resourceIds.map(async (id: number) => {
        try {
          const r = await resourcesApi.get(id);
          resourceMap.set(id, r);
        } catch {}
      }));
      setBookmarkResources(resourceMap);
    }).finally(() => setLoading(false));
  }, []);

  const removeBookmark = async (resourceId: number) => {
    await resourcesApi.bookmark(resourceId);
    setBookmarks(bookmarks.filter(b => b.resource_id !== resourceId));
    setBookmarkResources(prev => { const m = new Map(prev); m.delete(resourceId); return m; });
    setTotal(prev => prev - 1);
  };

  const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', other: 'Other' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookmarks ({total})</h1>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : bookmarks.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500 mb-4">No bookmarks yet.</p><Link to="/browse" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Browse Resources</Link></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((b: any) => {
            const r = bookmarkResources.get(b.resource_id);
            return (
              <div key={b.id} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
                {r ? (
                  <Link to={`/resource/${r.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{typeLabels[r.resource_type] || r.resource_type}</span>
                      {r.is_pyq && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">PYQ</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span>⬇ {r.download_count}</span>
                      <span>⭐ {r.rating_avg.toFixed(1)}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="text-sm text-gray-500">Resource #{b.resource_id}</div>
                )}
                <button onClick={() => removeBookmark(b.resource_id)} className="mt-3 text-xs text-red-500 hover:text-red-700">Remove Bookmark</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
