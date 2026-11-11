'use client';

import React, { useState, useEffect } from 'react';
import AuthPortal from './AuthPortal';
import StudyView from './StudyView';

export default function StudyApp() {
  const [hwid, setHwid] = useState('');
  const [user, setUser] = useState<{ username: string; is_admin: boolean } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'study' | 'settings' | 'admin'>('study');

  useEffect(() => {
    let deviceId = localStorage.getItem('class_device_hwid');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('class_device_hwid', deviceId);
    }
    setHwid(deviceId);

    const savedUser = localStorage.getItem('class_logged_user');
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('class_logged_user');
    setUser(null);
    setActiveTab('study');
  };

  if (!user) {
    return <AuthPortal hwid={hwid} onAuthSuccess={(userData, key) => {
      setUser(userData);
      if (key) setApiKey(key);
    }} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Class AI Study Helper</h1>
          <p className="text-xs text-slate-400">Logged in as {user.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('study')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'study' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Study</button>
          <button onClick={() => setActiveTab('settings')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'settings' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Settings</button>
          {user.is_admin && <button onClick={() => setActiveTab('admin')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'admin' ? 'bg-amber-600' : 'bg-slate-800 text-amber-400'}`}>Admin Panel</button>}
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-sm bg-red-950 text-red-300">Logout</button>
        </div>
      </header>

      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg">
          <h2 className="text-lg font-semibold mb-2">API Key Settings</h2>
          <input type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); localStorage.setItem('gemini_api_key', e.target.value); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100" placeholder="AIzaSy..." />
          <p className="text-xs text-emerald-400 mt-2">Saved automatically to your device.</p>
        </div>
      )}

      {activeTab === 'study' && <StudyView apiKey={apiKey} user={user} />}
    </div>
  );
}
