import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LU</span>
              </div>
              <span className="font-bold text-white">Academic Vault</span>
            </div>
            <p className="text-sm text-gray-400">Centralized academic resource platform for Lucknow University students.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/browse" className="block hover:text-white">Browse Resources</Link>
              <Link to="/pyqs" className="block hover:text-white">PYQ Library</Link>
              <Link to="/upload" className="block hover:text-white">Upload Material</Link>
              <Link to="/about" className="block hover:text-white">About</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Resources</h3>
            <div className="space-y-2 text-sm">
              <Link to="/browse?type=notes" className="block hover:text-white">Lecture Notes</Link>
              <Link to="/browse?type=pyq" className="block hover:text-white">PYQs</Link>
              <Link to="/browse?type=assignment" className="block hover:text-white">Assignments</Link>
              <Link to="/browse?type=syllabus" className="block hover:text-white">Syllabus</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Account</h3>
            <div className="space-y-2 text-sm">
              <Link to="/login" className="block hover:text-white">Login</Link>
              <Link to="/register" className="block hover:text-white">Register</Link>
              <Link to="/dashboard" className="block hover:text-white">Dashboard</Link>
              <Link to="/bookmarks" className="block hover:text-white">Bookmarks</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} LU Academic Vault. Built for Lucknow University students.</p>
        </div>
      </div>
    </footer>
  );
}
