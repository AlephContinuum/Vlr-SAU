import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Trophy } from 'lucide-react';

type SortField = 'PTS' | 'W' | 'RD' | 'GW' | 'GL' | 'RW' | 'RL';
type SortOrder = 'desc' | 'asc';

type TeamStanding = {
  teamId: string;
  name: string;
  MP: number;
  W: number;
  D: number;
  L: number;
  GW: number;
  GL: number;
  PTS: number;
  RD: number;
  RW: number;
  RL: number;
};

export default function Standings() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortConfig, setSortConfig] = useState<{field: SortField, order: SortOrder}>(() => {
    const saved = localStorage.getItem('standingsSort');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { field: 'PTS', order: 'desc' };
  });

  useEffect(() => {
    fetch('/api/standings')
      .then(r => r.json())
      .then(data => {
        setStandings(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('standingsSort', JSON.stringify(sortConfig));
  }, [sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        return { field, order: prev.order === 'desc' ? 'asc' : 'desc' };
      }
      return { field, order: 'desc' };
    });
  };

  const sortedStandings = [...standings].sort((a, b) => {
    const modifier = sortConfig.order === 'desc' ? -1 : 1;
    if (a[sortConfig.field] < b[sortConfig.field]) return 1 * modifier;
    if (a[sortConfig.field] > b[sortConfig.field]) return -1 * modifier;
    return 0; // Maintain original order (which handles H2H tiebreakers)
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.order === 'desc' 
      ? <ArrowDown className="w-3 h-3 ml-1 text-indigo-600" /> 
      : <ArrowUp className="w-3 h-3 ml-1 text-indigo-600" />;
  };

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
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tournament Standings</h2>
          <p className="text-sm text-slate-500">Official rankings with head-to-head tiebreakers</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-semibold w-16 text-center">#</th>
              <th className="px-6 py-4 font-semibold">Team</th>
              
              <th 
                className="px-6 py-4 font-semibold text-center cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('W')}
              >
                <div className="flex items-center justify-center">
                  W <SortIcon field="W" />
                </div>
              </th>
              
              <th className="px-6 py-4 font-semibold text-center">L</th>
              <th className="px-6 py-4 font-semibold text-center">T</th>
              
              <th 
                className="px-6 py-4 font-semibold text-center cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('GW')}
              >
                <div className="flex items-center justify-center">
                  MAP <SortIcon field="GW" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 font-semibold text-center cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('RW')}
              >
                <div className="flex items-center justify-center">
                  RND <SortIcon field="RW" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 font-semibold text-center cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('RD')}
              >
                <div className="flex items-center justify-center">
                  Δ <SortIcon field="RD" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 font-semibold text-center cursor-pointer group hover:bg-slate-100 transition-colors bg-indigo-50/30"
                onClick={() => handleSort('PTS')}
              >
                <div className="flex items-center justify-center text-indigo-900">
                  PTS <SortIcon field="PTS" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedStandings.map((team, index) => {
              const isTop4 = index < 4;
              const borderColor = isTop4 ? 'border-green-500' : 'border-red-500';
              
              return (
                <tr 
                  key={team.teamId} 
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className={`px-6 py-4 text-center font-medium text-slate-500 border-l-[4px] ${borderColor}`}>
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden border border-slate-200">
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${team.name}&backgroundColor=f1f5f9&textColor=4f46e5`} 
                          alt={team.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{team.name}</span>
                        <span className="text-xs text-slate-500">India</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-700">{team.W}</td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-700">{team.L}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{team.D}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{team.GW} / {team.GL}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{team.RW} / {team.RL}</td>
                  <td className={`px-6 py-4 text-center font-medium ${team.RD > 0 ? 'text-green-600' : team.RD < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                    {team.RD > 0 ? `+${team.RD}` : team.RD}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-indigo-600 bg-indigo-50/10">
                    {team.PTS}
                  </td>
                </tr>
              );
            })}
            
            {sortedStandings.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                  No teams found. Admin needs to generate matches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
