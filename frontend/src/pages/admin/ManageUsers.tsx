import { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import type { User } from '../../types';

export default function ManageUsers() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = (page = 1, s = search) => {
    setLoading(true);
    admin.getUsers(page, s).then(d => { setUsersList(d.users); setTotal(d.total); }).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleBan = async (id: number, isActive: boolean) => {
    await admin.updateUser(id, { is_active: !isActive });
    loadUsers();
  };

  const handleRole = async (id: number, role: string) => {
    await admin.updateUser(id, { role });
    loadUsers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Users ({total})</h1>
      <div className="flex gap-2 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1" />
        <button onClick={() => loadUsers(1, search)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Search</button>
      </div>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Actions</th></tr></thead>
            <tbody>{usersList.map(u => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{u.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><select value={u.role} onChange={e => handleRole(u.id, e.target.value)} className="text-xs border rounded px-2 py-1"><option value="student">Student</option><option value="admin">Admin</option></select></td>
                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'Active' : 'Banned'}</span></td>
                <td className="px-4 py-3"><button onClick={() => handleBan(u.id, u.is_active)} className={`text-xs font-medium ${u.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}>{u.is_active ? 'Ban' : 'Unban'}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
