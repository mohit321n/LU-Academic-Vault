import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { admin.getDashboard().then(setStats).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;
  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/users" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Manage Users</Link>
          <Link to="/admin/resources" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Manage Resources</Link>
          <Link to="/admin/departments" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Departments</Link>
          <Link to="/admin/reports" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Reports</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.total_users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Resources', value: stats.total_resources, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Downloads', value: stats.total_downloads, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Reports', value: stats.total_reports, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Weekly Uploads', value: stats.weekly_uploads, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'New Users (7d)', value: stats.weekly_users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} p-4 rounded-xl`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Uploads</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="uploads" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Resources by Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.uploads_by_type} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, count }) => `${type}: ${count}`}>
                {stats.uploads_by_type.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Resources by Semester</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.uploads_by_semester}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Uploaders</h2>
          <div className="space-y-3">
            {stats.top_uploaders.map((u: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">{u.name[0]}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{u.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((u.uploads / (stats.top_uploaders[0]?.uploads || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm text-gray-500">{u.uploads} uploads</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Top Resources</h2>
            <Link to="/admin/resources" className="text-sm text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="space-y-2">
            {stats.top_resources.slice(0, 8).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <Link to={`/resource/${r.id}`} className="text-sm text-gray-700 hover:text-blue-600 truncate mr-2">{r.title}</Link>
                <div className="flex items-center gap-3 text-xs text-gray-500 whitespace-nowrap">
                  <span>⭐ {r.rating_avg.toFixed(1)}</span>
                  <span>⬇ {r.downloads}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Uploads</h2>
            <Link to="/admin/resources" className="text-sm text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="space-y-2">
            {stats.recent_uploads.slice(0, 8).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <Link to={`/resource/${r.id}`} className="text-sm text-gray-700 hover:text-blue-600 truncate mr-2">{r.title}</Link>
                <div className="flex items-center gap-3 text-xs text-gray-500 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{r.resource_type}</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
