import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Shield, User, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginPage({ onLoginSuccess, initialRegister = false }) {
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'citizen'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isRegister) {
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }
        const data = await authService.register(formData);
        if (onLoginSuccess) onLoginSuccess(data.user);
        setSuccessMsg('Account registered successfully! Redirecting...');
        setTimeout(() => {
          navigate(data.user.role === 'admin' ? '/admin' : redirectPath);
        }, 800);
      } else {
        if (!formData.email || !formData.password) {
          setError('Please provide email and password.');
          setLoading(false);
          return;
        }
        const data = await authService.login({
          email: formData.email,
          password: formData.password
        });
        if (onLoginSuccess) onLoginSuccess(data.user);
        navigate(data.user.role === 'admin' ? '/admin' : redirectPath);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setIsRegister(false);
      setFormData({
        ...formData,
        email: 'admin@mbmc.gov.in',
        password: 'admin123'
      });
    } else {
      setIsRegister(false);
      setFormData({
        ...formData,
        email: 'citizen@example.com',
        password: 'citizen123'
      });
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '520px', paddingTop: '3rem' }}>
      <div className="card" style={{ boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ textAlign: 'center', padding: '2rem 1.5rem 1rem', background: '#fafbfd', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            {isRegister ? <UserPlus size={28} /> : <LogIn size={28} />}
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
            {isRegister ? 'Citizen & Staff Registration' : 'Municipal Portal Login'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {isRegister ? 'Create an MBMC civic account to track complaints' : 'Sign in as a Citizen or Municipal Administrator'}
          </p>
        </div>

        <div className="card-body" style={{ padding: '1.75rem' }}>
          {/* Quick Demo Fill Buttons for college demo */}
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1', marginBottom: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
              ⚡ DEMO SHORTCUT CREDENTIALS:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => handleDemoFill('admin')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                <Shield size={13} style={{ color: '#dc2626' }} /> Fill Admin
              </button>
              <button 
                type="button" 
                onClick={() => handleDemoFill('citizen')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                <User size={13} style={{ color: '#2563eb' }} /> Fill Citizen
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="form-control"
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="citizen">Citizen</option>
                    <option value="admin">Administrator / Municipal Officer</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="name@domain.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.88rem' }}>
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
