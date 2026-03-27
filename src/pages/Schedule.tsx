import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trophy } from 'lucide-react';

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

export default function Schedule() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => {
        // Sort matches: pending first, then by scheduled time
        const sorted = data.sort((a: Match, b: Match) => {
          if (a.status === 'pending' && b.status === 'completed') return -1;
          if (a.status === 'completed' && b.status === 'pending') return 1;
          
          if (a.scheduled_time && b.scheduled_time) {
            return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
          }
          if (a.scheduled_time) return -1;
          if (b.scheduled_time) return 1;
          
          return 0;
        });
        setMatches(sorted);
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Full Schedule</h1>
          <p className="text-slate-500 mt-1">All upcoming and completed matches</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Matches</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {matches.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No matches scheduled yet.
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Status & Stage */}
                  <div className="flex items-center gap-2">
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

                  {/* Teams & Score */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-4 w-full">
                      <div className={`flex-1 text-right font-medium ${match.status === 'completed' && match.score_a > match.score_b ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                        {match.team_a.name}
                      </div>
                      
                      <div className="bg-slate-100 px-4 py-2 rounded-lg font-mono font-bold text-lg min-w-[80px] text-center">
                        {match.status === 'completed' ? (
                          `${match.score_a} - ${match.score_b}`
                        ) : (
                          'vs'
                        )}
                      </div>
                      
                      <div className={`flex-1 text-left font-medium ${match.status === 'completed' && match.score_b > match.score_a ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                        {match.team_b.name}
                      </div>
                    </div>
                    
                    {match.status === 'completed' && match.games && match.games.length > 0 && (
                      <div className="text-xs text-slate-500 font-mono">
                        ({match.games.map(g => `${g.score_a}-${g.score_b}`).join(', ')})
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-end min-w-[140px] text-sm text-slate-500 gap-1.5">
                    {match.scheduled_time ? (
                      <>
                        <Clock className="w-4 h-4" />
                        {new Date(match.scheduled_time).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </>
                    ) : (
                      <span className="text-slate-400 italic">TBD</span>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
