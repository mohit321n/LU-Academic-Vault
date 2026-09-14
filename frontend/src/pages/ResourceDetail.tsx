import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resources as resourcesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Resource } from '../types';

const typeLabels: Record<string, string> = { notes: 'Notes', pyq: 'PYQ', assignment: 'Assignment', practical: 'Practical', syllabus: 'Syllabus', book: 'Book', lab_manual: 'Lab Manual', project: 'Project', other: 'Other' };

export default function ResourceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [userRating, setUserRating] = useState(0);
  const [userHelpful, setUserHelpful] = useState<boolean | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [reportReason, setReportReason] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    if (id) {
      resourcesApi.get(Number(id)).then(r => {
        setResource(r);
        setEditForm({ title: r.title, description: r.description || '' });
      }).finally(() => setLoading(false));
      if (user) {
        resourcesApi.checkBookmarked(Number(id)).then(d => setBookmarked(d.bookmarked));
        fetch(`/api/resources/${id}/my-rating`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d) { setUserRating(d.stars); setUserHelpful(d.helpful); } })
          .catch(() => {});
      }
      fetch(`/api/resources/${id}/similar`).then(r => r.json()).then(setSimilar).catch(() => {});
    }
  }, [id, user]);

  const handleBookmark = async () => {
    if (!user || !id) return;
    const res = await resourcesApi.bookmark(Number(id));
    setBookmarked(res.bookmarked);
    if (resource) setResource({ ...resource, bookmark_count: resource.bookmark_count + (res.bookmarked ? 1 : -1) });
  };

  const handleRate = async (stars: number) => {
    if (!user || !id) return;
    const res = await resourcesApi.rate(Number(id), stars, userHelpful ?? undefined);
    setUserRating(stars);
    if (resource) setResource({ ...resource, rating_avg: res.rating_avg, rating_count: res.rating_count });
  };

  const handleHelpful = async (helpful: boolean) => {
    if (!user || !id) return;
    const res = await resourcesApi.rate(Number(id), userRating || 3, helpful);
    setUserHelpful(helpful);
    if (resource) setResource({ ...resource, rating_avg: res.rating_avg });
  };

  const handleDownload = async () => {
    if (!user || !id) return;
    const res = await resourcesApi.download(Number(id));
    if (resource) setResource({ ...resource, download_count: resource.download_count + 1 });
    window.open(res.download_url, '_blank');
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this resource?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`/api/resources/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    navigate('/dashboard');
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    const token = localStorage.getItem('access_token');
    const res = await fetch(`/api/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { const updated = await res.json(); setResource({ ...resource!, ...updated }); setEditing(false); }
  };

  const handleReport = async () => {
    if (!id || !reportReason) return;
    await resourcesApi.report(Number(id), reportReason);
    setShowReport(false);
    setReportReason('');
    alert('Report submitted');
  };

  const handleAiSummarize = async () => {
    if (!id) return;
    setAiLoading(true);
    setShowAi(true);
    setAiResult('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/ai/summarize?resource_id=${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAiResult(data.summary || data.error || 'No result');
    } catch { setAiResult('Failed to get AI summary'); }
    setAiLoading(false);
  };

  const handleAiAnalyze = async () => {
    if (!id) return;
    setAiLoading(true);
    setShowAi(true);
    setAiResult('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/ai/analyze-pyq?resource_id=${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAiResult(data.analysis || data.error || 'No result');
    } catch { setAiResult('Failed to analyze PYQ'); }
    setAiLoading(false);
  };

  const formatSize = (bytes: number) => { for (const u of ['B','KB','MB','GB']) { if (bytes < 1024) return bytes.toFixed(1) + ' ' + u; bytes /= 1024; } return bytes.toFixed(1) + ' TB'; };
  const isOwner = user && resource && user.id === resource.uploader_id;
  const isAdmin = user?.role === 'admin';
  const isPdf = resource?.file_name?.toLowerCase().endsWith('.pdf');

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!resource) return <div className="text-center py-12 text-gray-500">Resource not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showPreview && isPdf && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-medium text-gray-900 truncate">{resource.file_name}</span>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <iframe src={`/api/files/preview/${resource.file_path}`} className="flex-1 w-full" title="PDF Preview" />
          </div>
        </div>
      )}

      {showReport && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Report Resource</h2>
            <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4">
              <option value="">Select reason...</option>
              <option value="incorrect">Incorrect material</option>
              <option value="duplicate">Duplicate material</option>
              <option value="spam">Spam</option>
              <option value="copyright">Copyright issue</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="wrong_category">Wrong subject/category</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowReport(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={handleReport} disabled={!reportReason} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50">Submit Report</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">{typeLabels[resource.resource_type] || resource.resource_type}</span>
            {resource.is_pyq && <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg">PYQ {resource.pyq_year}</span>}
          </div>
          <div className="flex gap-2">
            {(isOwner || isAdmin) && !editing && <button onClick={() => setEditing(true)} className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Edit</button>}
            {(isOwner || isAdmin) && <button onClick={handleDelete} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>}
          </div>
        </div>

        {editing ? (
          <div className="mb-4">
            <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
            <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
            <div className="flex gap-2 mt-2">
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{resource.title}</h1>
            {resource.description && <p className="text-gray-600 mb-4">{resource.description}</p>}
          </>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg"><div className="text-gray-500">File</div><div className="font-medium truncate" title={resource.file_name}>{resource.file_name}</div></div>
          <div className="bg-gray-50 p-3 rounded-lg"><div className="text-gray-500">Size</div><div className="font-medium">{formatSize(resource.file_size)}</div></div>
          <div className="bg-gray-50 p-3 rounded-lg"><div className="text-gray-500">Downloads</div><div className="font-medium">{resource.download_count}</div></div>
          <div className="bg-gray-50 p-3 rounded-lg"><div className="text-gray-500">Views</div><div className="font-medium">{resource.view_count}</div></div>
        </div>

        {resource.semester && <p className="text-sm text-gray-600 mb-1">Semester: {resource.semester}</p>}
        {resource.academic_year && <p className="text-sm text-gray-600 mb-1">Academic Year: {resource.academic_year}</p>}

        <div className="flex items-center gap-6 mt-6 pb-6 border-b">
          <div>
            <p className="text-xs text-gray-500 mb-1">Rate this resource</p>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => handleRate(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className={`text-2xl transition ${(hoverRating || userRating) >= s ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
              ))}
              <span className="ml-2 text-sm text-gray-500">({resource.rating_count})</span>
            </div>
          </div>
          {user && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Was this helpful?</p>
              <div className="flex gap-2">
                <button onClick={() => handleHelpful(true)} className={`px-3 py-1 rounded-lg text-sm border ${userHelpful === true ? 'bg-green-100 border-green-300 text-green-700' : 'border-gray-300 hover:bg-gray-50'}`}>👍 Yes</button>
                <button onClick={() => handleHelpful(false)} className={`px-3 py-1 rounded-lg text-sm border ${userHelpful === false ? 'bg-red-100 border-red-300 text-red-700' : 'border-gray-300 hover:bg-gray-50'}`}>👎 No</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {isPdf && <button onClick={() => setShowPreview(true)} className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Preview</button>}
          <button onClick={handleDownload} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Download</button>
          {user && <button onClick={handleBookmark} className={`px-6 py-2 border rounded-lg font-medium ${bookmarked ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{bookmarked ? 'Bookmarked' : 'Bookmark'}</button>}
          {user && !isOwner && <button onClick={() => setShowReport(true)} className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-red-600 hover:bg-red-50">Report</button>}
        </div>

        {isPdf && user && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500 self-center">AI:</span>
            <button onClick={handleAiSummarize} disabled={aiLoading} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 disabled:opacity-50">Summarize</button>
            {resource.is_pyq && <button onClick={handleAiAnalyze} disabled={aiLoading} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 disabled:opacity-50">Analyze PYQ</button>}
          </div>
        )}

        {showAi && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">🤖 AI Analysis</h3>
              <button onClick={() => setShowAi(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            {aiLoading ? (
              <div className="text-center py-4 text-gray-500">Analyzing with AI...</div>
            ) : (
              <div className="whitespace-pre-wrap text-sm text-gray-700">{aiResult}</div>
            )}
          </div>
        )}
      </div>

      {similar.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {similar.map((s: any) => (
              <Link key={s.id} to={`/resource/${s.id}`} className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
                <div className="font-medium text-gray-900 text-sm">{s.title}</div>
                <div className="text-xs text-gray-500 mt-1">⬇ {s.download_count} | {typeLabels[s.resource_type] || s.resource_type}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
