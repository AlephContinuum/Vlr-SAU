import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Plus, Clock } from 'lucide-react';

type Match = {
  id: string;
  team_a_id: string;
  team_b_id: string;
  score_a: number;
  score_b: number;
  status: string;
  stage: string;
  scheduled_time: string | null;
  team_a: { name: string };
  team_b: { name: string };
  games?: { score_a: number; score_b: number }[];
};

type Team = {
  id: string;
  name: string;
};

export default function MatchScheduler({ onUpdate }: { onUpdate: () => void, key?: any }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [stage, setStage] = useState('group');
  const [scheduledTime, setScheduledTime] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/teams').then(r => r.json()),
      fetch('/api/matches').then(r => r.json())
    ]).then(([teamsData, matchesData]) => {
      setTeams(teamsData);
      setMatches(matchesData);
    });
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || teamA === teamB) {
      setError('Please select two different teams');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          team_a_id: teamA, 
          team_b_id: teamB, 
          stage, 
          scheduled_time: scheduledTime || null 
        })
      });
      
      if (!res.ok) throw new Error('Failed to schedule match');
      
      setTeamA('');
      setTeamB('');
      setScheduledTime('');
      fetchData();
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete match');
      
      fetchData();
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Match Scheduler</h2>
          <p className="text-sm text-slate-500">Create custom matches and set schedules</p>
        </div>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAddMatch} className="space-y-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Team A</label>
              <select
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              >
                <option value="" disabled>Select Team A...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Team B</label>
              <select
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              >
                <option value="" disabled>Select Team B...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="group">Group Stage</option>
                <option value="playoff">Playoffs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Time (Optional)</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Schedule Match
          </button>
        </form>
        
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 mb-4">Scheduled Matches</h3>
          {matches.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No matches scheduled yet.</p>
          ) : (
            matches.map(match => (
              <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-colors gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      match.stage === 'playoff' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {match.stage}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      match.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="font-medium text-slate-900 flex items-center gap-2">
                    <span>{match.team_a.name}</span>
                    <span className="text-slate-400 text-sm">vs</span>
                    <span>{match.team_b.name}</span>
                  </div>
                  {match.status === 'completed' && match.games && match.games.length > 0 && (
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      ({match.games.map(g => `${g.score_a}-${g.score_b}`).join(', ')})
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {match.scheduled_time && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      {new Date(match.scheduled_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  )}
                  {deletingId === match.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 font-medium mr-1">Delete?</span>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(match.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
