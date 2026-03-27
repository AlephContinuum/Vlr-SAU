import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, RefreshCw, CheckCircle2, Clock, Lock } from 'lucide-react';

type Game = {
  score_a: number;
  score_b: number;
};

type Match = {
  id: string;
  team_a_id: string;
  team_b_id: string;
  score_a: number;
  score_b: number;
  status: string;
  games: Game[];
  team_a: { name: string };
  team_b: { name: string };
};

export default function MatchScoreEditor({ onUpdate }: { onUpdate: () => void, key?: any }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [games, setGames] = useState<Game[]>([{ score_a: 0, score_b: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = () => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(data => {
        setMatches(data);
        if (data.length > 0 && !selectedMatchId) {
          setSelectedMatchId(data[0].id);
        }
      });
  };

  const handleMatchSelect = (id: string) => {
    setSelectedMatchId(id);
    const match = matches.find(m => m.id === id);
    if (match && match.games && match.games.length > 0) {
      setGames(match.games);
    } else {
      setGames([{ score_a: 0, score_b: 0 }]);
    }
  };

  const handleGameChange = (index: number, field: 'score_a' | 'score_b', value: string) => {
    const newGames = [...games];
    newGames[index][field] = parseInt(value) || 0;
    setGames(newGames);
  };

  const addGame = () => {
    setGames([...games, { score_a: 0, score_b: 0 }]);
  };

  const removeGame = (index: number) => {
    const newGames = games.filter((_, i) => i !== index);
    setGames(newGames.length ? newGames : [{ score_a: 0, score_b: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate games
    for (const g of games) {
      if (isNaN(g.score_a) || isNaN(g.score_b) || g.score_a < 0 || g.score_b < 0) {
        setError('All scores must be valid integers >= 0');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/match/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ matchId: selectedMatchId, games })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update match');

      setSuccess('Match updated successfully');
      fetchMatches();
      onUpdate(); // trigger standings refresh
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  if (user?.role !== 'admin') {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center gap-2">
        <Lock className="w-5 h-5" />
        <span className="font-medium">Admin access required</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Update Match Scores</h2>
          <p className="text-sm text-slate-500">Record results to update standings</p>
        </div>
        <button 
          onClick={fetchMatches}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          title="Refresh matches"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
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
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Match</label>
            <select
              value={selectedMatchId}
              onChange={(e) => handleMatchSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700"
              required
            >
              <option value="" disabled>Select a match...</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.team_a.name} vs {m.team_b.name} {m.status === 'completed' ? `(${m.score_a} - ${m.score_b}) ${m.games && m.games.length > 0 ? `[${m.games.map(g => `${g.score_a}-${g.score_b}`).join(', ')}]` : ''}` : '(Pending)'}
                </option>
              ))}
            </select>
          </div>
          
          {selectedMatch && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  selectedMatch.status === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                } flex items-center gap-1`}>
                  {selectedMatch.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {selectedMatch.status}
                </span>
              </div>
              
              <div className="space-y-4">
                {games.map((game, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex-1 text-center">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">{selectedMatch.team_a.name}</div>
                      <input
                        type="number"
                        min="0"
                        value={game.score_a}
                        onChange={(e) => handleGameChange(index, 'score_a', e.target.value)}
                        className="w-20 text-center text-2xl font-bold px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-slate-400 font-bold text-sm">Game {index + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeGame(index)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="flex-1 text-center">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">{selectedMatch.team_b.name}</div>
                      <input
                        type="number"
                        min="0"
                        value={game.score_b}
                        onChange={(e) => handleGameChange(index, 'score_b', e.target.value)}
                        className="w-20 text-center text-2xl font-bold px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={addGame}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  + Add Game/Map
                </button>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !selectedMatchId}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Result
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
