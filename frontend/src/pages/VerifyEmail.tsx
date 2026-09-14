import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetch(`/api/auth/verify-email?token=${token}`, { method: 'POST' })
        .then(res => {
          if (res.ok) { setStatus('success'); setMessage('Email verified successfully!'); }
          else { res.json().then(d => { setStatus('error'); setMessage(d.detail || 'Verification failed'); }); }
        })
        .catch(() => { setStatus('error'); setMessage('Network error. Please try again.'); });
    } else {
      setStatus('error');
      setMessage('No verification token found.');
    }
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">LU</span>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {status === 'loading' && <div className="text-gray-500">Verifying your email...</div>}
          {status === 'success' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-500 mb-6">{message}</p>
              <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Go to Login</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-500 mb-6">{message}</p>
              <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Go to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
