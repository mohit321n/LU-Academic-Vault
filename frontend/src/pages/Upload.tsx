import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resources, departments as deptApi } from '../services/api';
import type { Department, Course, Subject } from '../types';

export default function Upload() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState({ title: '', description: '', resource_type: 'notes', department_id: '', course_id: '', subject_id: '', semester: '', academic_year: '', exam_type: '', university: '', is_pyq: false, pyq_year: '', tags: '' });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { deptApi.list().then(setDepartments); }, []);
  useEffect(() => { if (form.department_id) deptApi.getCourses(Number(form.department_id)).then(setCourses); }, [form.department_id]);
  useEffect(() => { if (form.course_id) deptApi.getSubjects(Number(form.course_id), form.semester ? Number(form.semester) : undefined).then(setSubjects); }, [form.course_id, form.semester]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== undefined) fd.append(k, String(v)); });
      fd.append('file', file);
      await resources.upload(fd);
      navigate('/dashboard');
    } catch (err: any) { setError(err.message || 'Upload failed'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Resource</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
            <select value={form.resource_type} onChange={e => setForm({ ...form, resource_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="notes">Notes</option><option value="pyq">PYQ</option><option value="assignment">Assignment</option><option value="practical">Practical</option><option value="syllabus">Syllabus</option><option value="book">Book</option><option value="lab_manual">Lab Manual</option><option value="project">Project</option><option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input type="text" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2024-25" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. data structures, algorithms" />
        </div>
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_pyq} onChange={e => setForm({ ...form, is_pyq: e.target.checked })} className="rounded" />
            <span className="text-sm font-medium text-gray-700">This is a Previous Year Question Paper</span>
          </label>
        </div>
        {form.is_pyq && <div className="mb-4 grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">PYQ Year</label><input type="number" value={form.pyq_year} onChange={e => setForm({ ...form, pyq_year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label><input type="text" value={form.exam_type} onChange={e => setForm({ ...form, exam_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. End Semester" /></div>
        </div>}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
          <input ref={fileRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, PPT, PPTX, PNG, JPG (max 50MB)</p>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{loading ? 'Uploading...' : 'Upload Resource'}</button>
      </form>
    </div>
  );
}
