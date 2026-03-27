import { useState, useEffect } from 'react';
import { Trophy, Clock, CheckCircle2 } from 'lucide-react';

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
};

export default function Playoffs() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(data => {
        setMatches(data.filter((m: Match) => m.stage === 'playoff'));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Playoffs</h2>
          <p className="text-sm text-slate-500">Knockout stage matches and results</p>
        </div>
      </div>
      
      <div className="p-6">
        {matches.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-900">No playoff matches yet</p>
            <p className="mt-1">The admin needs to schedule playoff matches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(match => (
              <div key={match.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-purple-300 transition-colors shadow-sm">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    match.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {match.status}
                  </span>
                  
                  {match.scheduled_time && (
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock className="w-3 h-3" />
                      {new Date(match.scheduled_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-semibold ${match.status === 'completed' && match.score_a > match.score_b ? 'text-slate-900' : 'text-slate-600'}`}>
                      {match.team_a.name}
                    </span>
                    <span className={`font-bold text-lg ${match.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>
                      {match.status === 'completed' ? match.score_a : '-'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${match.status === 'completed' && match.score_b > match.score_a ? 'text-slate-900' : 'text-slate-600'}`}>
                      {match.team_b.name}
                    </span>
                    <span className={`font-bold text-lg ${match.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>
                      {match.status === 'completed' ? match.score_b : '-'}
                    </span>
                  </div>
                </div>
                
                {match.status === 'completed' && (
                  <div className="bg-purple-50 px-4 py-2 border-t border-purple-100 flex items-center justify-center gap-2 text-sm font-medium text-purple-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {match.score_a > match.score_b ? match.team_a.name : match.team_b.name} advances
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
