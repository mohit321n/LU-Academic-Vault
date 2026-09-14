export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About LU Academic Vault</h1>
      <div className="prose prose-blue max-w-none">
        <p className="text-lg text-gray-600 mb-6">LU Academic Vault is a centralized academic resource platform built for Lucknow University students. It provides a single place to find, share, and organize study materials across all departments and courses.</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-4">To make academic resources easily accessible to every Lucknow University student, eliminating the hassle of searching through multiple sources for notes, PYQs, and study materials.</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What You Can Do</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Upload and share study materials with fellow students</li>
          <li>Search for resources by subject, department, semester, or topic</li>
          <li>Access Previous Year Question Papers (PYQs)</li>
          <li>Bookmark useful resources for quick access</li>
          <li>Rate and review resources to help others</li>
          <li>Preview PDFs directly in the browser</li>
        </ul>
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">For Lucknow University Students</h2>
        <p className="text-gray-600">This platform covers all departments including Engineering & Technology, Computer Applications, Commerce, Science, and Arts & Humanities. Whether you're looking for B.Tech CSE notes, BCA assignments, B.Com syllabus, or B.Sc lab manuals, you'll find it here.</p>
      </div>
    </div>
  );
}
