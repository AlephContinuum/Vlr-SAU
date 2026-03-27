/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Standings from './pages/Standings';
import Schedule from './pages/Schedule';
import Playoffs from './pages/Playoffs';
import Admin from './pages/Admin';
import Login from './pages/Login';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/standings" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/standings" replace />} />
            <Route path="standings" element={<Standings />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="playoffs" element={<Playoffs />} />
            <Route path="login" element={<Login />} />
            <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
