import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Resources', path: '/admin/resources', icon: '📁' },
  { label: 'Departments', path: '/admin/departments', icon: '🏛' },
  { label: 'Reports', path: '/admin/reports', icon: '🚨' },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Panel</h2>
        <nav className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
