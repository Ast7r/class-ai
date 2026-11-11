'use client';

import React, { useState } from 'react';

interface AuthProps {
  hwid: string;
  onAuthSuccess: (user: { username: string; is_admin: boolean }, apiKey?: string) => void;
}

export default function AuthPortal({ hwid, onAuthSuccess }: AuthProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: authMode, username: username.trim(), password, hwid }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
      } else {
        localStorage.setItem('class_logged_user', JSON.stringify(data));
        if (authMode === 'register') {
          localStorage.setItem('gemini_api_key', apiKeyInput.trim());
        }
        onAuthSuccess(data, authMode === 'register' ? apiKeyInput.trim() : undefined);
      }
    } catch {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">Class AI Portal</h1>
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg mb-6">
          <button onClick={() => setAuthMode('login')} className={`py-2 rounded-md text-sm ${authMode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Login</button>
          <button onClick={() => setAuthMode('register')} className={`py-2 rounded-md text-sm ${authMode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Register</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required placeholder="Class Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100" />
          {authMode === 'register' && (
            <input type="password" required placeholder="Gemini API Key (AIzaSy...)" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100" />
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 py-2.5 rounded-lg text-sm font-medium">{loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Register & Lock Device'}</button>
        </form>
      </div>
    </div>
  );
}
