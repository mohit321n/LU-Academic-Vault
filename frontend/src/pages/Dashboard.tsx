import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { users } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [bookmarkTotal, setBookmarkTotal] = useState(0);

  useEffect(() => {
    users.getMyUploads().then(d => { setUploads(d.resources); setUploadTotal(d.total); });
    users.getMyBookmarks().then(d => { setBookmarks(d.bookmarks); setBookmarkTotal(d.total); });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.full_name}</h1>
      <p className="text-gray-500 mb-8">Your academic resource dashboard</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{uploadTotal}</div>
          <div className="text-gray-600 mt-1">My Uploads</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-yellow-500">{bookmarkTotal}</div>
          <div className="text-gray-600 mt-1">Bookmarks</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <Link to="/upload" className="block text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mt-4">Upload New Resource</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Uploads</h2>
          {uploads.length === 0 ? <p className="text-gray-500 text-sm">No uploads yet.</p> : uploads.map((u: any) => (
            <Link key={u.id} to={`/resource/${u.id}`} className="block p-3 bg-white rounded-lg border border-gray-200 mb-2 hover:shadow-sm transition">
              <div className="font-medium text-gray-900 text-sm">{u.title}</div>
              <div className="text-xs text-gray-500 mt-1">⬇ {u.download_count} downloads</div>
            </Link>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bookmarks</h2>
          {bookmarks.length === 0 ? <p className="text-gray-500 text-sm">No bookmarks yet.</p> : bookmarks.map((b: any) => (
            <div key={b.id} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
              <div className="text-sm text-gray-700">Resource #{b.resource_id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
