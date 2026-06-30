import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, ShieldCheck, BookOpen, User } from 'lucide-react';

const ROLE_OPTIONS = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access: Add, Edit, Delete students',
    icon: ShieldCheck,
    color: '#6366f1',
  },
  {
    value: 'teacher',
    label: 'Teacher',
    description: 'Can add & edit students, view all records',
    icon: BookOpen,
    color: '#10b981',
  },
  {
    value: 'student',
    label: 'Student',
    description: 'View-only access to the dashboard',
    icon: User,
    color: '#f59e0b',
  },
];

export default function Register({ setAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-screen-center animate-fade-in" style={{ padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem' }}>
        <h2 className="auth-title">Create Account</h2>

        {/* Role Selector */}
        <div style={{ marginBottom: '1.75rem' }}>
          <p className="form-label" style={{ marginBottom: '0.75rem' }}>I am registering as...</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {ROLE_OPTIONS.map(({ value, label, description, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                style={{
                  background: role === value ? `rgba(${hexToRgb(color)}, 0.15)` : 'rgba(0,0,0,0.2)',
                  border: `2px solid ${role === value ? color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '10px',
                  padding: '1rem 0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: role === value ? color : 'var(--text-secondary)',
                }}
              >
                <Icon size={22} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: role === value ? color : 'var(--text-primary)' }}>
                  {label}
                </span>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', lineHeight: 1.3 }}>
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--danger)',
            marginBottom: '1.25rem', fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="glass-input" value={name}
              onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="glass-input" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="glass-input" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength="8" />
          </div>

          <button
            type="submit"
            className="glass-button"
            style={{ width: '100%', marginTop: '1.25rem' }}
            disabled={loading}
          >
            <UserPlus size={20} />
            {loading ? 'Creating Account...' : `Sign Up as ${ROLE_OPTIONS.find(r => r.value === role)?.label}`}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login"><span>Login</span></Link>
        </div>
      </div>
    </div>
  );
}

// Helper to convert hex color to rgb for background rgba
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241';
}
