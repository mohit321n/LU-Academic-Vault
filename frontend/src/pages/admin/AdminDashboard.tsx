import { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import type { DashboardStats } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { admin.getDashboard().then(setStats).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200"><div className="text-3xl font-bold text-blue-600">{stats.total_users}</div><div className="text-gray-600 text-sm mt-1">Total Users</div></div>
        <div className="bg-white p-6 rounded-xl border border-gray-200"><div className="text-3xl font-bold text-green-600">{stats.total_resources}</div><div className="text-gray-600 text-sm mt-1">Total Resources</div></div>
        <div className="bg-white p-6 rounded-xl border border-gray-200"><div className="text-3xl font-bold text-purple-600">{stats.total_downloads}</div><div className="text-gray-600 text-sm mt-1">Total Downloads</div></div>
        <div className="bg-white p-6 rounded-xl border border-gray-200"><div className="text-3xl font-bold text-red-600">{stats.total_reports}</div><div className="text-gray-600 text-sm mt-1">Pending Reports</div></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200"><div className="text-sm text-gray-500">Monthly Uploads</div><div className="text-2xl font-bold text-gray-900">{stats.monthly_uploads}</div></div>
        <div className="bg-white p-4 rounded-xl border border-gray-200"><div className="text-sm text-gray-500">Monthly Downloads</div><div className="text-2xl font-bold text-gray-900">{stats.monthly_downloads}</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Resources</h2>
          {stats.top_resources.map(r => (
            <div key={r.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700 truncate mr-2">{r.title}</span>
              <span className="text-sm text-gray-500 whitespace-nowrap">⬇ {r.downloads}</span>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Uploads</h2>
          {stats.recent_uploads.map(r => (
            <div key={r.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700 truncate mr-2">{r.title}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
