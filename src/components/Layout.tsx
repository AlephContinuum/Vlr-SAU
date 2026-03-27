import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Trophy } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-indigo-600">
            <Trophy className="w-5 h-5" />
            <span>TournamentPro</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/standings" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Standings
            </Link>
            <Link to="/schedule" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Schedule
            </Link>
            <Link to="/playoffs" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Playoffs
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
