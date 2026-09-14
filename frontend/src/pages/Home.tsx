import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resources as resourcesApi, departments as deptApi } from '../services/api';
import type { Resource, Department } from '../types';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', project: 'Project', other: 'Other' };

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularResources, setPopularResources] = useState<Resource[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [latestPyqs, setLatestPyqs] = useState<Resource[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    resourcesApi.list({ sort: 'popular', per_page: 6 }).then(d => setPopularResources(d.resources));
    resourcesApi.list({ sort: 'newest', per_page: 6 }).then(d => setRecentResources(d.resources));
    resourcesApi.list({ is_pyq: true, sort: 'newest', per_page: 6 }).then(d => setLatestPyqs(d.resources));
    deptApi.list().then(setDepartments);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const stats = [
    { label: 'Resources', value: '1000+', icon: '📚' },
    { label: 'Students', value: '500+', icon: '👥' },
    { label: 'Downloads', value: '5000+', icon: '⬇️' },
    { label: 'PYQs', value: '200+', icon: '📄' },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-sm mb-6 backdrop-blur">For Lucknow University Students</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">All Your Lucknow University Study Material in One Place</h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Find notes, PYQs, assignments and academic resources uploaded by students across all departments.</p>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notes, subjects, PYQs, paper codes..." className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white outline-none" />
            <button type="submit" className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition">Search</button>
          </form>
          <div className="flex gap-4 justify-center mt-6">
            <Link to="/browse" className="px-6 py-2 border-2 border-white rounded-lg hover:bg-white hover:text-blue-700 transition font-medium">Explore Resources</Link>
            <Link to="/upload" className="px-6 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition font-medium">Upload Material</Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Notes', type: 'notes', icon: '📝', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
            { label: 'PYQs', type: 'pyq', icon: '📄', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
            { label: 'Assignments', type: 'assignment', icon: '📋', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
            { label: 'Syllabus', type: 'syllabus', icon: '📑', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
            { label: 'Books', type: 'book', icon: '📚', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' },
          ].map(item => (
            <Link key={item.type} to={`/browse?type=${item.type}`} className={`p-4 rounded-xl border border-gray-200 hover:shadow-md transition text-center ${item.color}`}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-medium">{item.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {latestPyqs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest PYQs</h2>
            <Link to="/pyqs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestPyqs.map(r => (
              <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">PYQ</span>
                  {r.pyq_year && <span className="text-xs text-gray-500 font-medium">{r.pyq_year}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <span>⬇ {r.download_count}</span>
                  <span>Sem {r.semester || '-'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {popularResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Resources</h2>
            <Link to="/browse?sort=popular" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularResources.map(r => (
              <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{typeLabels[r.resource_type] || r.resource_type}</span>
                <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">{r.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <span>⬇ {r.download_count}</span>
                  <span>⭐ {r.rating_avg.toFixed(1)}</span>
                  <span>👁 {r.view_count}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recently Uploaded</h2>
            <Link to="/browse?sort=newest" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentResources.map(r => (
              <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">{typeLabels[r.resource_type] || r.resource_type}</span>
                <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">{r.title}</h3>
                <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {departments.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Department</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(d => (
              <Link key={d.id} to={`/browse?department_id=${d.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition">
                <div className="font-semibold text-gray-900">{d.name}</div>
                {d.description && <div className="text-sm text-gray-500 mt-1">{d.description}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Contribute?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Share your notes, PYQs, and study materials with fellow Lucknow University students. Help others succeed.</p>
          <Link to="/register" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg">Get Started Free</Link>
        </div>
      </section>
    </div>
  );
}
