import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resources as resourcesApi, departments as deptApi } from '../services/api';
import type { Resource, Department } from '../types';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularResources, setPopularResources] = useState<Resource[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    resourcesApi.list({ sort: 'popular', per_page: 6 }).then(d => setPopularResources(d.resources));
    resourcesApi.list({ sort: 'newest', per_page: 6 }).then(d => setRecentResources(d.resources));
    deptApi.list().then(setDepartments);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', project: 'Project', other: 'Other' };

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Your Lucknow University Study Material in One Place</h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Find notes, PYQs, assignments and academic resources uploaded by students.</p>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes, subjects, PYQs, paper codes..."
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white outline-none"
            />
            <button type="submit" className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition">Search</button>
          </form>
          <div className="flex gap-4 justify-center mt-6">
            <Link to="/browse" className="px-6 py-2 border-2 border-white rounded-lg hover:bg-white hover:text-blue-700 transition font-medium">Explore Resources</Link>
            <Link to="/upload" className="px-6 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition font-medium">Upload Material</Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Notes', type: 'notes', icon: '📝' },
            { label: 'PYQs', type: 'pyq', icon: '📄' },
            { label: 'Assignments', type: 'assignment', icon: '📋' },
            { label: 'Syllabus', type: 'syllabus', icon: '📑' },
            { label: 'Books', type: 'book', icon: '📚' },
          ].map(item => (
            <Link key={item.type} to={`/browse?type=${item.type}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-medium text-gray-900">{item.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {popularResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Resources</h2>
            <Link to="/browse?sort=popular" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularResources.map(r => (
              <Link key={r.id} to={`/resource/${r.id}`} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{typeLabels[r.resource_type] || r.resource_type}</span>
                  <span className="text-xs text-gray-500">Sem {r.semester || '-'}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h3>
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
    </div>
  );
}
