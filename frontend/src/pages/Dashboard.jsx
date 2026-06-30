import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  LogOut, Plus, Trash2, Edit, X, Save, Users,
  BarChart2, ChevronLeft, GraduationCap, UserCheck,
  BookOpen, Shield, Clock, TrendingUp, Search, RefreshCw
} from 'lucide-react';

// ─── Student Form Component ────────────────────────────────────
function StudentForm({ student, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    rollNumber: student?.rollNumber || '',
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    className: student?.className || '',
    section: student?.section || '',
    guardianName: student?.guardianName || '',
    status: student?.status || 'active'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (student) {
        await api.patch(`/students/${student._id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem',
          background: 'linear-gradient(to right, #818cf8, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          {student ? `Editing: ${student.firstName} ${student.lastName}` : '➕ Add New Student'}
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '0.85rem 1rem', color: 'var(--danger)',
            marginBottom: '1.5rem', fontSize: '0.9rem'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input type="text" className="glass-input" value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })} required minLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input type="text" className="glass-input" value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })} required minLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input type="text" className="glass-input" placeholder="e.g. 2025001" value={formData.rollNumber}
                onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Class / Course *</label>
              <input type="text" className="glass-input" placeholder="e.g. MCA, 10th, B.Tech" value={formData.className}
                onChange={e => setFormData({ ...formData, className: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Section / Division</label>
              <input type="text" className="glass-input" placeholder="e.g. A, FY, SY" value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Guardian Name *</label>
              <input type="text" className="glass-input" value={formData.guardianName}
                onChange={e => setFormData({ ...formData, guardianName: e.target.value })} required minLength={2} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Status</label>
              <select className="glass-input" value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="active" style={{ color: 'black' }}>✅ Active</option>
                <option value="inactive" style={{ color: 'black' }}>❌ Inactive</option>
                <option value="graduated" style={{ color: 'black' }}>🎓 Graduated</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onCancel} className="glass-button danger" style={{ flex: 1 }}>
              <X size={18} /> Cancel
            </button>
            <button type="submit" className="glass-button" style={{ flex: 2 }} disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : (student ? 'Update Student' : 'Save Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Student Card Component ────────────────────────────────────
function StudentCard({ student, user, onEdit, onDelete }) {
  const canManage = user?.role === 'admin' || user?.role === 'teacher';
  const statusColors = {
    active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Active' },
    inactive: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Inactive' },
    graduated: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'Graduated' },
  };
  const sc = statusColors[student.status] || statusColors.active;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Avatar + Name */}
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700
          }}>
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{student.fullName || `${student.firstName} ${student.lastName}`}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>#{student.rollNumber}</div>
          </div>
        </div>
        {/* Status Badge */}
        <span style={{
          padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem',
          fontWeight: 700, textTransform: 'uppercase', background: sc.bg, color: sc.color
        }}>{sc.label}</span>
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>📚 <strong style={{ color: 'var(--text-primary)' }}>{student.className}</strong>{student.section ? ` – ${student.section}` : ''}</div>
        <div>👤 <strong style={{ color: 'var(--text-primary)' }}>{student.guardianName}</strong></div>
        {student.email && <div style={{ gridColumn: '1/-1' }}>📧 {student.email}</div>}
        <div style={{ gridColumn: '1/-1', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Added by {student.createdBy?.name || 'System'}
        </div>
      </div>

      {/* Actions */}
      {canManage && (
        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
          <button className="glass-button" style={{ padding: '7px 14px', fontSize: '0.85rem', flex: 1 }} onClick={() => onEdit(student)}>
            <Edit size={14} /> Edit
          </button>
          {user?.role === 'admin' && (
            <button className="glass-button danger" style={{ padding: '7px 14px', fontSize: '0.85rem', flex: 1 }} onClick={() => onDelete(student._id)}>
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Student-Role-Only View ────────────────────────────────────
function StudentSelfView({ user }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '620px', margin: '2rem auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700, margin: '0 auto 1.5rem'
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{user?.name}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{user?.email}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Role</div>
            <div style={{ fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>👤 Student</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Account Status</div>
            <div style={{ fontWeight: 700, color: '#10b981' }}>✅ Active</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>📋 Your Permissions</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <li>✅ View your own account information</li>
            <li>✅ Access the system dashboard</li>
            <li>❌ Cannot view student records (Admin/Teacher only)</li>
            <li>❌ Cannot add or edit students</li>
            <li>❌ Cannot delete records</li>
          </ul>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            💡 Contact your Admin or Teacher if you need to update your information or change your role.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function Dashboard({ setAuth }) {
  const [students, setStudents] = useState([]);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const canManage = user?.role === 'admin' || user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    // Only fetch students if user has permission
    if (userData?.role !== 'student') {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students?limit=100');
      setStudents(res.data.data.items);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const openAdd = () => { setEditingStudent(null); setView('add'); };
  const openEdit = (s) => { setEditingStudent(s); setView('edit'); };
  const handleSaved = () => { fetchStudents(); setView('list'); };

  // Filter students by search term
  const filteredStudents = students.filter(s =>
    !search ||
    s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.className?.toLowerCase().includes(search.toLowerCase())
  );

  const totalActive = students.filter(s => s.status === 'active').length;
  const totalGraduated = students.filter(s => s.status === 'graduated').length;
  const totalInactive = students.filter(s => s.status === 'inactive').length;

  // Role badge colors
  const roleBadge = {
    admin: { bg: 'rgba(99,102,241,0.2)', color: '#818cf8', icon: '🛡️' },
    teacher: { bg: 'rgba(16,185,129,0.2)', color: '#10b981', icon: '📖' },
    student: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b', icon: '👤' },
  };
  const rb = roleBadge[user?.role] || roleBadge.student;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ─── Navbar ─── */}
      <nav className="glass-panel" style={{
        margin: '1rem', marginBottom: 0, padding: '0.85rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {(view === 'add' || view === 'edit') && (
            <button onClick={() => setView('list')} style={{
              background: 'none', border: 'none', color: 'var(--primary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem'
            }}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <GraduationCap size={24} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>EduPlus Campus</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Welcome, <strong>{user?.name}</strong>
              <span style={{
                marginLeft: '0.5rem', padding: '2px 7px', borderRadius: '20px', fontSize: '0.68rem',
                background: rb.bg, color: rb.color, fontWeight: 700, textTransform: 'uppercase'
              }}>{rb.icon} {user?.role}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {canManage && view === 'list' && (
            <button className="glass-button" onClick={openAdd} style={{ padding: '7px 14px', fontSize: '0.88rem' }}>
              <Plus size={16} /> Add Student
            </button>
          )}
          {canManage && view === 'list' && (
            <button onClick={fetchStudents} style={{
              background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)',
              borderRadius: '8px', padding: '7px 12px', cursor: 'pointer'
            }}>
              <RefreshCw size={16} />
            </button>
          )}
          <button className="glass-button danger" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: '0.88rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* ─── Page Body ─── */}
      <main style={{ flex: 1, padding: '1.25rem' }}>

        {/* STUDENT ROLE: Show personal profile only */}
        {isStudent && <StudentSelfView user={user} />}

        {/* ADMIN / TEACHER: Full dashboard */}
        {!isStudent && view === 'list' && (
          <div className="animate-fade-in">

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { icon: <Users size={22} color="#818cf8" />, value: students.length, label: 'Total Students', color: '#818cf8' },
                { icon: <UserCheck size={22} color="#10b981" />, value: totalActive, label: 'Active', color: '#10b981' },
                { icon: <GraduationCap size={22} color="#c084fc" />, value: totalGraduated, label: 'Graduated', color: '#c084fc' },
                { icon: <TrendingUp size={22} color="#f59e0b" />, value: totalInactive, label: 'Inactive', color: '#f59e0b' },
              ].map(({ icon, value, label, color }) => (
                <div key={label} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: `${color}20`, borderRadius: '10px', padding: '0.65rem', display: 'flex' }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{loading ? '...' : value}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* RBAC Info Banner */}
            <div className="glass-panel" style={{
              padding: '0.85rem 1.25rem', marginBottom: '1.25rem', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: user?.role === 'admin' ? 'rgba(99,102,241,0.08)' : 'rgba(16,185,129,0.08)',
              borderColor: user?.role === 'admin' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
            }}>
              {user?.role === 'admin' ? <Shield size={18} color="#818cf8" /> : <BookOpen size={18} color="#10b981" />}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {user?.role === 'admin'
                  ? '🛡️ You are an Admin — you have full access: add, edit, and delete students.'
                  : '📖 You are a Teacher — you can add and edit students, but cannot delete records.'}
              </span>
            </div>

            {/* Search Bar */}
            {students.length > 0 && (
              <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: 400 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="glass-input"
                  placeholder="Search by name, roll no, class..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            )}

            {/* Student Grid */}
            {loading ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <RefreshCw size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                <Users size={52} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                  {search ? 'No students match your search.' : 'No students added yet.'}
                </p>
                {!search && canManage && (
                  <button className="glass-button" onClick={openAdd} style={{ marginTop: '1.5rem' }}>
                    <Plus size={18} /> Add Your First Student
                  </button>
                )}
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
                </p>
                <div className="students-grid">
                  {filteredStudents.map(student => (
                    <StudentCard
                      key={student._id}
                      student={student}
                      user={user}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Add / Edit Form */}
        {!isStudent && (view === 'add' || view === 'edit') && (
          <StudentForm
            student={editingStudent}
            onSave={handleSaved}
            onCancel={() => setView('list')}
          />
        )}
      </main>
    </div>
  );
}
