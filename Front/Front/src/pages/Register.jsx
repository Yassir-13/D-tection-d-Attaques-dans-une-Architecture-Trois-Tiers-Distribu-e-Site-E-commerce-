import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(state => state.register);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (formData.password !== formData.password_confirmation) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.password_confirmation);
      navigate('/account');
    } catch (err) {
      const messages = err.response?.data?.errors;
      if (messages) {
        // Laravel validation returns an object of field => [messages]
        const firstError = Object.values(messages)[0]?.[0];
        setError(firstError || 'Registration failed. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
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

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: '300',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Create Account
          </h1>
          <p className="label">Join LUXE — exclusive member benefits</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#c0392b',
            }}>
              {error}
            </div>
          )}

          <input
            type="text"
            required
            className="input-field"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange('name')}
          />
          <input
            type="email"
            required
            className="input-field"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange('email')}
          />
          <input
            type="password"
            required
            className="input-field"
            placeholder="Password (min. 8 characters)"
            value={formData.password}
            onChange={handleChange('password')}
          />
          <input
            type="password"
            required
            className="input-field"
            placeholder="Confirm password"
            value={formData.password_confirmation}
            onChange={handleChange('password_confirmation')}
          />

          <div style={{ marginTop: '4px', marginBottom: '8px' }}>
            <Link to="/login" style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-brand-mid)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}>
              Already have an account?
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
