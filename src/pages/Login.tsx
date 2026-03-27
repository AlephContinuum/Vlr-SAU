import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/standings');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        <p className="text-slate-500 mt-2">Sign in to access tournament features</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="admin@test.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-md hover:bg-indigo-700 transition-colors mt-6"
        >
          Sign In
        </button>
      </form>
      
      <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500 text-center">
        <p>Demo Accounts:</p>
        <p className="mt-1">Admin: <span className="font-mono text-slate-700">admin@test.com</span> / <span className="font-mono text-slate-700">password</span></p>
        <p>Player: <span className="font-mono text-slate-700">player@test.com</span> / <span className="font-mono text-slate-700">password</span></p>
      </div>
    </div>
  );
}
