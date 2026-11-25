import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, BookOpen, Globe, Save, Camera } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', education: '', languages: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', bio: user.bio || '', education: user.education || '', languages: (user.languages || []).join(', ') });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        ...form, languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
      });
      updateUser(res.data.data);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-8)' }}>
          Edit <span className="text-gradient">Profile</span>
        </h1>

        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <div className="avatar avatar-xl" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{user?.email}</p>
              <span className={`badge badge-${user?.role === 'admin' ? 'error' : 'primary'}`} style={{ marginTop: 'var(--space-2)' }}>{user?.role}</span>
            </div>
          </div>

          {msg && <div style={{ padding: 'var(--space-3) var(--space-4)', background: msg.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-sm)', color: msg.includes('Failed') ? 'var(--error-500)' : 'var(--success-500)' }}>{msg}</div>}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell us about yourself..." />
            </div>
            <div className="form-group">
              <label className="form-label">Education/Background</label>
              <input className="form-input" value={form.education} onChange={e => setForm({...form, education: e.target.value})} placeholder="Your education or background" />
            </div>
            <div className="form-group">
              <label className="form-label">Languages (comma-separated)</label>
              <input className="form-input" value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} placeholder="English, Hindi, Spanish" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><span className="spinner spinner-sm" /> Saving...</> : <><Save size={18} /> Save Profile</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
