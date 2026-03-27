import { useState } from 'react';
import MatchScoreEditor from '../components/MatchScoreEditor';
import TeamManager from '../components/TeamManager';
import MatchScheduler from '../components/MatchScheduler';
import AdminSettings from '../components/AdminSettings';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, RefreshCw, Calendar, Users, Edit3, Settings } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'scores' | 'teams' | 'schedule' | 'settings'>('scores');

  const handleUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  const handleGenerateMatches = async () => {
    // Custom confirmation logic could be added here, but for now we'll just proceed
    setGenerating(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/matches/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to generate matches');
      
      setMessage('Matches generated successfully!');
      handleUpdate();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Error generating matches');
    } finally {
      setGenerating(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage tournament settings and results</p>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-lg border ${message.includes('Error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message}
        </div>
      )}

      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('scores')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'scores' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Update Scores
          </div>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'schedule' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Match Schedule
          </div>
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'teams' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Manage Teams
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'settings' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {activeTab === 'scores' && <MatchScoreEditor key={`scores-${updateTrigger}`} onUpdate={handleUpdate} />}
          {activeTab === 'schedule' && <MatchScheduler key={`schedule-${updateTrigger}`} onUpdate={handleUpdate} />}
          {activeTab === 'teams' && <TeamManager key={`teams-${updateTrigger}`} onUpdate={handleUpdate} />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Auto-Generate</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
              Generate a new round-robin schedule for all registered teams. Warning: This resets current progress.
            </p>
            
            <button
              onClick={handleGenerateMatches}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Matches
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
