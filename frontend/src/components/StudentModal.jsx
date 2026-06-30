import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../api';

export default function StudentModal({ isOpen, onClose, student, onSave }) {
  const [formData, setFormData] = useState({
    rollNumber: '',
    firstName: '',
    lastName: '',
    className: '',
    section: '',
    guardianName: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        rollNumber: student.rollNumber || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        className: student.className || '',
        section: student.section || '',
        guardianName: student.guardianName || '',
        status: student.status || 'active'
      });
    } else {
      setFormData({
        rollNumber: '', firstName: '', lastName: '',
        className: '', section: '', guardianName: '', status: 'active'
      });
    }
    setError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (student) {
        await api.patch(`/students/${student._id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content animate-fade-in">
        <div className="modal-header">
          <h2 className="auth-title" style={{ margin: 0, fontSize: '1.5rem' }}>
            {student ? 'Edit Student' : 'Add Student'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input 
                type="text" className="glass-input" 
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input 
                type="text" className="glass-input" 
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input 
                type="text" className="glass-input" 
                value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class</label>
              <input 
                type="text" className="glass-input" 
                value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Section</label>
              <input 
                type="text" className="glass-input" 
                value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Guardian Name</label>
              <input 
                type="text" className="glass-input" 
                value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="glass-input" 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="active" style={{color: 'black'}}>Active</option>
              <option value="inactive" style={{color: 'black'}}>Inactive</option>
              <option value="graduated" style={{color: 'black'}}>Graduated</option>
            </select>
          </div>

          <button type="submit" className="glass-button" style={{ width: '100%', marginTop: '1rem' }}>
            <Save size={20} />
            {student ? 'Update Student' : 'Save Student'}
          </button>
        </form>
      </div>
    </div>
  );
}
