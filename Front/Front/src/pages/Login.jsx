import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  // PrivateRoute passes the original path as state so we can redirect back
  const from = location.state?.from || '/account';

  // Forgot Password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    setForgotLoading(true);
    try {
      await api.post('/forgot-password', { email: forgotEmail });
      setForgotMsg('If an account exists with this email, a reset link has been sent.');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Unable to process request. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-up">

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: '300',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Sign In
          </h1>
          <p className="label">Access your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#c0392b',
              letterSpacing: '0.02em',
            }}>
              {error}
            </div>
          )}

          <input
            type="email"
            required
            className="input-field"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', marginBottom: '8px' }}>
            <Link to="/register" style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-brand-mid)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}>
              Create Account
            </Link>
            <button
              type="button"
              onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotMsg(''); setForgotError(''); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-brand-mid)',
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-fade-in">
          <div onClick={() => setShowForgot(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.35)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: 'var(--color-brand-white)', padding: '36px', maxWidth: '420px', width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span className="label" style={{ color: 'var(--color-brand-black)' }}>Reset Password</span>
              <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--color-brand-mid)', fontWeight: '300', lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-brand-mid)', marginBottom: '20px', lineHeight: '1.7' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {forgotMsg && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', fontSize: '12px', color: '#15803d', marginBottom: '16px' }}>
                {forgotMsg}
              </div>
            )}
            {forgotError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', fontSize: '12px', color: '#c0392b', marginBottom: '16px' }}>
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="email"
                required
                className="input-field"
                placeholder="Email address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <button type="submit" className="btn-primary" disabled={forgotLoading}>
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
