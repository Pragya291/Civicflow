import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Search, 
  PlusCircle, 
  Home, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  User 
} from 'lucide-react';
import { authService } from '../services/api';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <div className="brand-emblem">
            <AlertTriangle size={24} />
          </div>
          <div className="brand-text">
            <h1>Mira-Bhayandar</h1>
            <span>Pothole Management Portal</span>
          </div>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Home size={17} /> Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/report" className={({ isActive }) => `nav-link nav-link-report ${isActive ? 'active' : ''}`}>
                <PlusCircle size={17} /> Report Pothole
              </NavLink>
            </li>
            <li>
              <NavLink to="/track" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Search size={17} /> Track Complaint
              </NavLink>
            </li>
            <li>
              <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <MapPin size={17} /> Pothole Map
              </NavLink>
            </li>

            {user && user.role === 'admin' && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={17} /> Admin Dashboard
                </NavLink>
              </li>
            )}

            <div className="nav-auth-group">
              {user ? (
                <>
                  <div className="user-badge" title={user.email}>
                    <User size={15} />
                    <span>{user.name.split(' ')[0]}</span>
                    <span className={`role-tag ${user.role}`}>{user.role}</span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-secondary btn-sm"
                    title="Logout"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm">
                  <LogIn size={15} /> Login / Register
                </Link>
              )}
            </div>
          </ul>
        </nav>
      </div>
    </header>
  );
}
