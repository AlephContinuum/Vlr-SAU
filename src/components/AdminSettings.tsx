import React, { useState } from 'react';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newPassword: password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
          <p className="text-sm text-slate-500">Update your admin password</p>
        </div>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-6 border border-green-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Password updated successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
