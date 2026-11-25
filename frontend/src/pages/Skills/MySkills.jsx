import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Upload, CheckCircle, XCircle, Clock, Shield, AlertCircle, ExternalLink } from 'lucide-react';

const MySkills = () => {
  const [skills, setSkills] = useState({ learning: [], teaching: [] });
  const [allSkills, setAllSkills] = useState([]);
  const [tab, setTab] = useState('learning');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profLevel, setProfLevel] = useState('intermediate');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const [myRes, allRes] = await Promise.all([api.get('/skills/my-skills'), api.get('/skills')]);
      setSkills(myRes.data.data);
      setAllSkills(allRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addSkill = async (type) => {
    const finalSkillId = selectedSkill || searchTerm;
    if (!finalSkillId) return;
    try {
      const endpoint = type === 'learning' ? '/skills/add-learning' : '/skills/add-teaching';
      await api.post(endpoint, { skillId: finalSkillId, proficiencyLevel: profLevel });
      setShowAdd(false);
      setSelectedSkill('');
      setSearchTerm('');
      fetchSkills();
    } catch (err) { alert(err.response?.data?.error || 'Failed to add skill'); }
  };

  const statusColors = { learning_interest: 'info', proofs_pending: 'warning', proofs_rejected: 'error', assessment_pending: 'warning', assessment_in_progress: 'primary', verified: 'success', suspended: 'error' };
  const statusLabels = { learning_interest: 'Learning', proofs_pending: 'Proofs Pending', proofs_rejected: 'Proofs Rejected', assessment_pending: 'Assessment Ready', assessment_in_progress: 'Assessment In Progress', verified: 'Verified ✓', suspended: 'Suspended' };

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>;

  const currentSkills = tab === 'learning' ? skills.learning : skills.teaching;

  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}>My <span className="text-gradient">Skills</span></h1>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Skill</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <button className={`btn ${tab === 'learning' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('learning')}>
            <BookOpen size={16} /> Learning ({skills.learning.length})
          </button>
          <button className={`btn ${tab === 'teaching' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('teaching')}>
            <Shield size={16} /> Teaching ({skills.teaching.length})
          </button>
        </div>

        {currentSkills.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No {tab} skills yet. Add one to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {currentSkills.map(us => (
              <div key={us._id} className="card" style={{ padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{us.skillId?.name || 'Unknown Skill'}</h3>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>Level: {us.proficiencyLevel}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <span className={`badge badge-${statusColors[us.status]}`}>{statusLabels[us.status]}</span>
                  {tab === 'teaching' && us.status === 'proofs_pending' && (
                    <a href={`/proofs?skillId=${us.skillId?._id}&userSkillId=${us._id}`} className="btn btn-outline btn-sm">
                      <Upload size={14} /> Submit Proofs
                    </a>
                  )}
                  {tab === 'teaching' && us.status === 'assessment_pending' && (
                    <a href={`/assessment?skillId=${us.skillId?._id}&userSkillId=${us._id}`} className="btn btn-primary btn-sm">
                      Take Assessment
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Skill Modal */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Add Skill</h2>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)', position: 'relative' }}>
                <label className="form-label">Select Skill</label>
                <input
                  className="form-select"
                  type="text"
                  placeholder="Search or type a skill..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && searchTerm && (
                  <div className="suggestions-list" style={{
                    position: 'absolute',
                    zIndex: 100,
                    width: '100%',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {allSkills
                      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(s => (
                        <div
                          key={s._id}
                          className="suggestion-item"
                          style={{ padding: 'var(--space-3)', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                          onClick={() => {
                            setSelectedSkill(s._id);
                            setSearchTerm(s.name);
                            setShowSuggestions(false);
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          {s.name} ({s.category})
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label className="form-label">Proficiency Level</label>
                <select className="form-select" value={profLevel} onChange={e => setProfLevel(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn-primary" onClick={() => addSkill('learning')}>Add as Learning</button>
                <button className="btn btn-outline" onClick={() => addSkill('teaching')}>Add as Teaching</button>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySkills;
