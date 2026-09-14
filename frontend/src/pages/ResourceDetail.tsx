import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resources as resourcesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Resource } from '../types';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', project: 'Project', other: 'Other' };

export default function ResourceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      resourcesApi.get(Number(id)).then(r => { setResource(r); setRating(r.rating_avg); }).finally(() => setLoading(false));
      if (user) resourcesApi.checkBookmarked(Number(id)).then(d => setBookmarked(d.bookmarked));
    }
  }, [id, user]);

  const handleBookmark = async () => {
    if (!user || !id) return;
    const res = await resourcesApi.bookmark(Number(id));
    setBookmarked(res.bookmarked);
  };

  const handleRate = async (stars: number) => {
    if (!user || !id) return;
    const res = await resourcesApi.rate(Number(id), stars);
    setRating(res.rating_avg);
  };

  const handleDownload = async () => {
    if (!user || !id) return;
    const res = await resourcesApi.download(Number(id));
    if (resource) {
      setResource({ ...resource, download_count: resource.download_count + 1 });
      window.open(res.download_url, '_blank');
    }
  };

  const formatSize = (bytes: number) => { for (const u of ['B','KB','MB','GB']) { if (bytes < 1024) return bytes.toFixed(1) + ' ' + u; bytes /= 1024; } return bytes.toFixed(1) + ' TB'; };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!resource) return <div className="text-center py-12 text-gray-500">Resource not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">{typeLabels[resource.resource_type] || resource.resource_type}</span>
          {resource.is_pyq && <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg">PYQ {resource.pyq_year}</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{resource.title}</h1>
        {resource.description && <p className="text-gray-600 mb-4">{resource.description}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg"><div className="text-gray-500">File</div><div className="font-medium truncate">{resource.file_name}</div></div>
          <div className="bg-gray-50 p-3 rounded-lg"><div className="text-gray-500">Size</div><div className="font-medium">{formatSize(resource.file_size)}</div></div>
          <div className="bg-gray-50 p-3 rounded-lg"><div className="text-gray-500">Downloads</div><div className="font-medium">{resource.download_count}</div></div>
          <div className="bg-gray-50 p-3 rounded-lg"><div className="text-gray-500">Views</div><div className="font-medium">{resource.view_count}</div></div>
        </div>
        {resource.semester && <p className="text-sm text-gray-600 mb-1">Semester: {resource.semester}</p>}
        {resource.academic_year && <p className="text-sm text-gray-600 mb-1">Academic Year: {resource.academic_year}</p>}
        {resource.exam_type && <p className="text-sm text-gray-600 mb-1">Exam Type: {resource.exam_type}</p>}
        <div className="flex items-center gap-1 mt-4 mb-4">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => handleRate(s)} className={`text-2xl ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
          ))}
          <span className="ml-2 text-sm text-gray-500">({resource.rating_count} ratings)</span>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Download</button>
          {user && <button onClick={handleBookmark} className={`px-6 py-2 border rounded-lg font-medium ${bookmarked ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{bookmarked ? 'Bookmarked' : 'Bookmark'}</button>}
        </div>
      </div>
    </div>
  );
}
