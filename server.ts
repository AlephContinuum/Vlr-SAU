import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const hasSupabase = supabaseUrl && supabaseKey;
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseKey) : null;

// Mock Database for fully independent local execution
const mockDb = {
  users: [
    { id: '1', email: 'admin@test.com', password: 'password', role: 'admin' },
    { id: '2', email: 'player@test.com', password: 'password', role: 'player' }
  ],
  teams: [
    { id: 't1', name: 'Team Alpha' },
    { id: 't2', name: 'Team Beta' },
    { id: 't3', name: 'Team Gamma' },
    { id: 't4', name: 'Team Delta' }
  ],
  matches: [
    { id: 'm1', team_a_id: 't1', team_b_id: 't2', score_a: 0, score_b: 0, status: 'pending', stage: 'group', scheduled_time: '2026-04-01T18:00', games: [] },
    { id: 'm2', team_a_id: 't3', team_b_id: 't4', score_a: 0, score_b: 0, status: 'pending', stage: 'group', scheduled_time: '2026-04-01T20:00', games: [] },
    { id: 'm3', team_a_id: 't1', team_b_id: 't3', score_a: 0, score_b: 0, status: 'pending', stage: 'group', scheduled_time: '2026-04-02T18:00', games: [] },
    { id: 'm4', team_a_id: 't2', team_b_id: 't4', score_a: 0, score_b: 0, status: 'pending', stage: 'group', scheduled_time: '2026-04-02T20:00', games: [] },
    { id: 'm5', team_a_id: 't1', team_b_id: 't4', score_a: 0, score_b: 0, status: 'pending', stage: 'playoff', scheduled_time: '2026-04-10T18:00', games: [] }
  ]
};

// Auth Middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (hasSupabase) {
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    
    const { data: userData } = await supabase!.from('users').select('role').eq('id', data.user.id).single();
    const role = userData?.role || 'player';
    
    const token = Buffer.from(JSON.stringify({ id: data.user.id, email: data.user.email, role })).toString('base64');
    return res.json({ token, user: { id: data.user.id, email: data.user.email, role } });
  } else {
    const user = mockDb.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role })).toString('base64');
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }
});

app.get('/api/auth/session', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const user = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return res.json({ user });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.put('/api/admin/password', requireAdmin, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (hasSupabase) {
    // Note: Supabase auth password changes typically require the user to be logged in and use updateUser
    // For this mock/hybrid setup, we'll just return success or assume it's handled via Supabase UI
    return res.json({ success: true, message: 'In a real Supabase setup, use Supabase Auth to change passwords.' });
  } else {
    const adminUser = mockDb.users.find(u => u.id === (req as any).user.id);
    if (adminUser) {
      adminUser.password = newPassword;
      return res.json({ success: true });
    } else {
      return res.status(404).json({ error: 'Admin user not found' });
    }
  }
});

// Teams API
app.get('/api/teams', async (req, res) => {
  if (hasSupabase) {
    const { data } = await supabase!.from('teams').select('*');
    return res.json(data || []);
  }
  return res.json(mockDb.teams);
});

app.post('/api/teams', requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Team name is required' });

  if (hasSupabase) {
    const { data, error } = await supabase!.from('teams').insert([{ name }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } else {
    const newTeam = { id: 't' + Date.now(), name };
    mockDb.teams.push(newTeam);
    return res.json(newTeam);
  }
});

app.delete('/api/teams/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (hasSupabase) {
    await supabase!.from('teams').delete().eq('id', id);
    return res.json({ success: true });
  } else {
    mockDb.teams = mockDb.teams.filter(t => t.id !== id);
    mockDb.matches = mockDb.matches.filter(m => m.team_a_id !== id && m.team_b_id !== id);
    return res.json({ success: true });
  }
});

// Matches API
app.get('/api/matches', async (req, res) => {
  if (hasSupabase) {
    const { data } = await supabase!.from('matches').select('*, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name)');
    return res.json(data || []);
  }
  
  const matches = mockDb.matches.map(m => ({
    ...m,
    team_a: { name: mockDb.teams.find(t => t.id === m.team_a_id)?.name || 'Unknown' },
    team_b: { name: mockDb.teams.find(t => t.id === m.team_b_id)?.name || 'Unknown' }
  }));
  return res.json(matches);
});

app.post('/api/matches', requireAdmin, async (req, res) => {
  const { team_a_id, team_b_id, scheduled_time, stage } = req.body;
  if (!team_a_id || !team_b_id) return res.status(400).json({ error: 'Teams are required' });

  if (hasSupabase) {
    const { data, error } = await supabase!.from('matches').insert([{ team_a_id, team_b_id, scheduled_time, stage, score_a: 0, score_b: 0, status: 'pending', games: [] }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } else {
    const newMatch = {
      id: 'm' + Date.now(),
      team_a_id,
      team_b_id,
      score_a: 0,
      score_b: 0,
      status: 'pending',
      stage: stage || 'group',
      scheduled_time: scheduled_time || null,
      games: []
    };
    mockDb.matches.push(newMatch);
    return res.json(newMatch);
  }
});

app.delete('/api/matches/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (hasSupabase) {
    await supabase!.from('matches').delete().eq('id', id);
    return res.json({ success: true });
  } else {
    mockDb.matches = mockDb.matches.filter(m => m.id !== id);
    return res.json({ success: true });
  }
});

app.post('/api/match/update', requireAdmin, async (req, res) => {
  const { matchId, games } = req.body;
  if (!Array.isArray(games)) {
    return res.status(400).json({ error: 'Invalid games format' });
  }

  let scoreA = 0;
  let scoreB = 0;
  games.forEach(g => {
    if (g.score_a > g.score_b) scoreA++;
    else if (g.score_b > g.score_a) scoreB++;
  });

  if (hasSupabase) {
    const { error } = await supabase!.from('matches').update({ score_a: scoreA, score_b: scoreB, games, status: 'completed' }).eq('id', matchId);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  } else {
    const match = mockDb.matches.find(m => m.id === matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    match.score_a = scoreA;
    match.score_b = scoreB;
    (match as any).games = games;
    match.status = 'completed';
    return res.json({ success: true });
  }
});

app.post('/api/matches/generate', requireAdmin, async (req, res) => {
  if (hasSupabase) {
    return res.json({ success: true });
  } else {
    mockDb.matches = [];
    const teams = mockDb.teams;
    let matchId = 1;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        mockDb.matches.push({
          id: `m${matchId++}`,
          team_a_id: teams[i].id,
          team_b_id: teams[j].id,
          score_a: 0,
          score_b: 0,
          status: 'pending',
          stage: 'group',
          scheduled_time: null,
          games: []
        });
      }
    }
    return res.json({ success: true });
  }
});

app.get('/api/standings', async (req, res) => {
  let teams: any[] = [];
  let matches: any[] = [];

  if (hasSupabase) {
    const { data: tData } = await supabase!.from('teams').select('*');
    const { data: mData } = await supabase!.from('matches').select('*').eq('status', 'completed').eq('stage', 'group');
    teams = tData || [];
    matches = mData || [];
  } else {
    teams = mockDb.teams;
    // Only count group stage matches for standings
    matches = mockDb.matches.filter(m => m.status === 'completed' && m.stage === 'group');
  }

  const standings = teams.map(team => ({
    teamId: team.id,
    name: team.name,
    MP: 0, W: 0, D: 0, L: 0, GW: 0, GL: 0, PTS: 0, RD: 0, RW: 0, RL: 0
  }));

  const teamStats: Record<string, any> = {};
  standings.forEach(s => teamStats[s.teamId] = s);

  matches.forEach(m => {
    const tA = teamStats[m.team_a_id];
    const tB = teamStats[m.team_b_id];
    if (!tA || !tB) return;

    tA.MP++; tB.MP++;

    const games = m.games || [];
    if (games.length > 0) {
      games.forEach((g: any) => {
        tA.RD += (g.score_a - g.score_b);
        tB.RD += (g.score_b - g.score_a);
        tA.RW += g.score_a;
        tA.RL += g.score_b;
        tB.RW += g.score_b;
        tB.RL += g.score_a;
        if (g.score_a > g.score_b) { tA.GW++; tB.GL++; }
        else if (g.score_b > g.score_a) { tB.GW++; tA.GL++; }
      });
    } else {
      tA.RD += (m.score_a - m.score_b);
      tB.RD += (m.score_b - m.score_a);
      tA.RW += m.score_a;
      tA.RL += m.score_b;
      tB.RW += m.score_b;
      tB.RL += m.score_a;
    }

    if (m.score_a > m.score_b) {
      tA.W++; tA.PTS += 3;
      tB.L++;
    } else if (m.score_b > m.score_a) {
      tB.W++; tB.PTS += 3;
      tA.L++;
    } else {
      tA.D++; tB.D++;
      tA.PTS += 1; tB.PTS += 1;
    }
  });

  standings.sort((a, b) => {
    if (b.PTS !== a.PTS) return b.PTS - a.PTS;

    const tiedTeams = standings.filter(t => t.PTS === a.PTS);
    if (tiedTeams.length === 2) {
      const match = matches.find(m =>
        (m.team_a_id === a.teamId && m.team_b_id === b.teamId) ||
        (m.team_a_id === b.teamId && m.team_b_id === a.teamId)
      );
      if (match) {
        if (match.team_a_id === a.teamId && match.score_a > match.score_b) return -1;
        if (match.team_a_id === a.teamId && match.score_a < match.score_b) return 1;
        if (match.team_b_id === a.teamId && match.score_b > match.score_a) return -1;
        if (match.team_b_id === a.teamId && match.score_b < match.score_a) return 1;
      }
    }

    const gdB = b.GW - b.GL;
    const gdA = a.GW - a.GL;
    if (gdB !== gdA) return gdB - gdA;

    return b.RD - a.RD;
  });

  res.json(standings);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
