import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReportPotholePage from './pages/ReportPotholePage';
import TrackComplaintPage from './pages/TrackComplaintPage';
import PotholeMapPage from './pages/PotholeMapPage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { authService } from './services/api';

export default function App() {
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Optionally re-verify token/profile if user exists in localStorage
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPotholePage user={user} />} />
            <Route path="/track" element={<TrackComplaintPage user={user} />} />
            <Route path="/map" element={<PotholeMapPage />} />
            <Route 
              path="/login" 
              element={
                user ? (
                  <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
                ) : (
                  <LoginPage onLoginSuccess={handleLoginSuccess} />
                )
              } 
            />
            <Route 
              path="/admin" 
              element={<AdminDashboardPage user={user} />} 
            />
            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
