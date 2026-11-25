import { useState, useEffect } from 'react';
import { Users, BookOpen, Shield, Calendar, AlertTriangle, Settings, FileText, CheckCircle, XCircle, Award } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingProofs, setPendingProofs] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [anlRes, proofRes] = await Promise.all([api.get('/analytics/admin'), api.get('/skill-proofs/pending')]);
        setAnalytics(anlRes.data.data);
        setPendingProofs(proofRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const fetchUsers = async () => {
    try { const res = await api.get('/users/all', { params: { page: usersPage, limit: 20 } }); setUsers(res.data.data); }
    catch (e) { console.error(e); }
  };

  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, usersPage]);

  const reviewProof = async (proofId, status, notes = '') => {
    try {
      await api.patch(`/skill-proofs/${proofId}/review`, { status, reviewNotes: notes });
      setPendingProofs(prev => prev.filter(p => p._id !== proofId));
    } catch (e) { alert(e.response?.data?.error || 'Review failed'); }
  };

  const updateUserStatus = async (userId, status) => {
    try { await api.patch(`/users/${userId}/status`, { status }); fetchUsers(); }
    catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>;

  const a = analytics || {};

  return (
    <div style={{ padding: 'var(--space-8) 0' }}><div className="container">
      <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>Admin <span className="text-gradient">Dashboard</span></h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {[['overview', 'Overview'], ['proofs', `Proof Review (${pendingProofs.length})`], ['users', 'Users']].map(([key, label]) => (
          <button key={key} className={`btn ${tab === key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            {[
              { icon: <Users size={20} />, label: 'Total Users', value: a.totalUsers, color: 'var(--primary-400)' },
              { icon: <Shield size={20} />, label: 'Verified Skills', value: a.verifiedSkills, color: 'var(--success-500)' },
              { icon: <Calendar size={20} />, label: 'Bookings', value: a.bookings?.total, color: 'var(--accent-400)' },
              { icon: <AlertTriangle size={20} />, label: 'Open Reports', value: a.openReports, color: 'var(--error-500)' },
            ].map(s => (
              <div key={s.label} className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <div><p style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>{s.value || 0}</p><p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{s.label}</p></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>User Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Learners</span><strong>{a.roleBreakdown?.learners || 0}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Mentors</span><strong>{a.roleBreakdown?.mentors || 0}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Admins</span><strong>{a.roleBreakdown?.admins || 0}</strong></div>
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Assessments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total</span><strong>{a.assessments?.total || 0}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Passed</span><strong>{a.assessments?.passed || 0}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pass Rate</span><strong>{a.assessments?.passRate || 0}%</strong></div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'proofs' && (
        <>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Pending Proof Reviews</h2>
          {pendingProofs.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No pending proofs. All caught up!</p> : (
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {pendingProofs.map(p => (
                <div key={p._id} className="card" style={{ padding: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div>
                      <h3 style={{ fontWeight: 700 }}>{p.title}</h3>
                      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>By: {p.userId?.name} • Skill: {p.skillId?.name} • Type: {p.proofType}</p>
                      {p.description && <p style={{ fontSize: 'var(--font-sm)', marginTop: 'var(--space-2)' }}>{p.description}</p>}
                      {p.externalUrl && <a href={p.externalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-sm)', color: 'var(--primary-300)' }}>View Link ↗</a>}
                      {p.fileUrl && <a href={`http://localhost:5000${p.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-sm)', color: 'var(--primary-300)', marginLeft: 'var(--space-3)' }}>View File ↗</a>}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => reviewProof(p._id, 'approved')}><CheckCircle size={14} /> Approve</button>
                      <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--error-500)', color: 'var(--error-500)' }}
                        onClick={() => { const n = prompt('Rejection reason:'); if (n) reviewProof(p._id, 'rejected', n); }}>
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'users' && (
        <>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>User Management</h2>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {users.map(u => (
              <div key={u._id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{u.name}</p>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{u.email} • {u.role} • Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <span className={`badge badge-${u.status === 'active' ? 'success' : 'error'}`}>{u.status}</span>
                  {u.status === 'active' ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => updateUserStatus(u._id, 'suspended')}>Suspend</button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={() => updateUserStatus(u._id, 'active')}>Activate</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div></div>
  );
};

export default AdminDashboard;
