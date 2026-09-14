import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { users } from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', department: user?.department || '', course: user?.course || '', semester: user?.semester || '', roll_number: user?.roll_number || '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    try {
      await users.updateMe({ ...form, semester: form.semester ? Number(form.semester) : undefined } as any);
      setMsg('Profile updated!');
    } catch { setError('Update failed'); }
    setLoading(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5242880) { setError('Avatar must be under 5MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Only JPG, PNG, WebP allowed'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/users/me/avatar', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok) { setMsg('Avatar updated!'); }
      else { setError(data.detail || 'Upload failed'); }
    } catch { setError('Avatar upload failed'); }
    setUploadingAvatar(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
              {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-3xl text-blue-600 font-bold">{user?.full_name?.[0] || '?'}</span>}
            </div>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Change Photo</button>
            {avatarFile && <button onClick={handleAvatarUpload} disabled={uploadingAvatar} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{uploadingAvatar ? 'Uploading...' : 'Save Photo'}</button>}
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200">
        {msg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{msg}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Course</label><input type="text" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Semester</label><input type="number" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label><input type="text" value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
