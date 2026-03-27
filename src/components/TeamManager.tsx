import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Users } from 'lucide-react';

type Team = {
  id: string;
  name: string;
};

export default function TeamManager({ onUpdate }: { onUpdate: () => void, key?: any }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = () => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data));
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newTeamName })
      });
      
      if (!res.ok) throw new Error('Failed to add team');
      
      setNewTeamName('');
      fetchTeams();
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete team');
      
      fetchTeams();
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
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Management</h2>
          <p className="text-sm text-slate-500">Add or remove teams from the tournament</p>
        </div>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAddTeam} className="flex gap-3 mb-6">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="New Team Name"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Team
          </button>
        </form>
        
        <div className="space-y-2">
          {teams.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No teams added yet.</p>
          ) : (
            teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-medium text-slate-700">{team.name}</span>
                {deletingId === team.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 font-medium mr-1">Delete?</span>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
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
                    onClick={() => setDeletingId(team.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
