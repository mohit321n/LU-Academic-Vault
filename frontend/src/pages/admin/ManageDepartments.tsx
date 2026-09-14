import { useState, useEffect } from 'react';
import { departments as deptApi } from '../../services/api';
import type { Department, Course, Subject } from '../../types';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });
  const [newCourse, setNewCourse] = useState({ name: '', code: '', department_id: 0 });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', course_id: 0, semester_number: 1 });
  const [msg, setMsg] = useState('');

  useEffect(() => { deptApi.list().then(d => { setDepartments(d); setLoading(false); }); }, []);

  useEffect(() => {
    if (selectedDept) {
      deptApi.getCourses(selectedDept).then(setCourses);
      setSubjects([]);
      setSelectedCourse(null);
    }
  }, [selectedDept]);

  useEffect(() => {
    if (selectedCourse) {
      deptApi.getSubjects(selectedCourse).then(setSubjects);
    }
  }, [selectedCourse]);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newDept),
    });
    if (res.ok) { setMsg('Department added!'); setNewDept({ name: '', code: '', description: '' }); deptApi.list().then(setDepartments); }
    else { setMsg('Failed to add department'); }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newCourse, department_id: selectedDept }),
    });
    if (res.ok) { setMsg('Course added!'); setNewCourse({ name: '', code: '', department_id: 0 }); if (selectedDept) deptApi.getCourses(selectedDept).then(setCourses); }
    else { setMsg('Failed to add course'); }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newSubject, course_id: selectedCourse }),
    });
    if (res.ok) { setMsg('Subject added!'); setNewSubject({ name: '', code: '', course_id: 0, semester_number: 1 }); if (selectedCourse) deptApi.getSubjects(selectedCourse).then(setSubjects); }
    else { setMsg('Failed to add subject'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Academic Structure</h1>
      {msg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Departments</h2>
          <div className="space-y-2 mb-4">
            {departments.map(d => (
              <button key={d.id} onClick={() => setSelectedDept(d.id)} className={`w-full text-left p-3 rounded-lg border ${selectedDept === d.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="font-medium text-sm">{d.name}</div>
                <div className="text-xs text-gray-500">{d.code}</div>
              </button>
            ))}
          </div>
          <form onSubmit={handleAddDept} className="p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Add Department</h3>
            <input type="text" placeholder="Name" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm mb-2" required />
            <input type="text" placeholder="Code" value={newDept.code} onChange={e => setNewDept({ ...newDept, code: e.target.value })} className="w-full px-2 py-1 border rounded text-sm mb-2" required />
            <button type="submit" className="w-full py-1 bg-blue-600 text-white rounded text-sm">Add</button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Courses {selectedDept ? '' : '(Select Department)'}</h2>
          {selectedDept && (
            <>
              <div className="space-y-2 mb-4">
                {courses.map(c => (
                  <button key={c.id} onClick={() => setSelectedCourse(c.id)} className={`w-full text-left p-3 rounded-lg border ${selectedCourse === c.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.code}</div>
                  </button>
                ))}
              </div>
              <form onSubmit={handleAddCourse} className="p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Add Course</h3>
                <input type="text" placeholder="Name" value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm mb-2" required />
                <input type="text" placeholder="Code" value={newCourse.code} onChange={e => setNewCourse({ ...newCourse, code: e.target.value })} className="w-full px-2 py-1 border rounded text-sm mb-2" required />
                <button type="submit" className="w-full py-1 bg-blue-600 text-white rounded text-sm">Add</button>
              </form>
            </>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Subjects {selectedCourse ? '' : '(Select Course)'}</h2>
          {selectedCourse && (
            <>
              <div className="space-y-2 mb-4">
                {subjects.map(s => (
                  <div key={s.id} className="p-3 rounded-lg border border-gray-200">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.code} | Sem {s.semester_number}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddSubject} className="p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Add Subject</h3>
                <input type="text" placeholder="Name" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm mb-2" required />
                <input type="text" placeholder="Code" value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} className="w-full px-2 py-1 border rounded text-sm mb-2" required />
                <select value={newSubject.semester_number} onChange={e => setNewSubject({ ...newSubject, semester_number: Number(e.target.value) })} className="w-full px-2 py-1 border rounded text-sm mb-2">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
                <button type="submit" className="w-full py-1 bg-blue-600 text-white rounded text-sm">Add</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
