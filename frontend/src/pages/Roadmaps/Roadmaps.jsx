import { useState, useEffect } from 'react';
import { Map, CheckCircle, Circle, Plus, Sparkles, Clock, Target, BookOpen } from 'lucide-react';
import api from '../../services/api';

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create Roadmap Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillId, setSkillId] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [targetLevel, setTargetLevel] = useState('advanced');
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [goals, setGoals] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
    fetchSkills();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get('/roadmaps');
      setRoadmaps(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await api.get('/skills');
      setSkills(res.data.data || []);
      if (res.data.data?.length > 0) setSkillId(res.data.data[0]._id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    if (!skillId) return;
    setCreateLoading(true);
    try {
      const res = await api.post('/roadmaps', {
        skillId,
        currentLevel,
        targetLevel,
        weeklyHours: parseInt(weeklyHours),
        goals
      });
      setShowCreate(false);
      setGoals('');
      await fetchRoadmaps();
      setSelected(res.data.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate roadmap');
    } finally {
      setCreateLoading(false);
    }
  };

  const completeStage = async (roadmapId, stageIndex) => {
    try {
      const res = await api.patch(`/roadmaps/${roadmapId}/stage/${stageIndex}/complete`);
      setSelected(res.data.data);
      const updatedRes = await api.get('/roadmaps');
      setRoadmaps(updatedRes.data.data || []);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to complete stage');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}>
              Learning <span className="text-gradient">Roadmaps</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
              AI-generated step-by-step milestones, exercises, and mini-projects tailored to your learning goals.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> Generate AI Roadmap
          </button>
        </div>

        {roadmaps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Map size={48} style={{ opacity: 0.4, margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>No roadmaps yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Click below to generate a customized AI learning path for any skill!
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              + Generate First Roadmap
            </button>
          </div>
        ) : !selected ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
            {roadmaps.map(r => (
              <div
                key={r._id}
                className="glass-card"
                style={{ padding: 'var(--space-6)', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border-subtle)' }}
                onClick={() => setSelected(r)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontWeight: 800, fontSize: 'var(--font-lg)' }}>{r.title}</h3>
                  <span className="badge badge-primary">{r.estimatedWeeks} Weeks</span>
                </div>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  {r.skillId?.name} • {r.currentLevel} → {r.targetLevel}
                </p>
                <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden', marginBottom: 'var(--space-2)' }}>
                  <div style={{ width: `${r.overallProgress}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                  <span>{r.overallProgress}% Complete</span>
                  <span>{r.stages?.length} Stages</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button className="btn btn-ghost" onClick={() => setSelected(null)} style={{ marginBottom: 'var(--space-4)' }}>
              ← Back to All Roadmaps
            </button>
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>{selected.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                    Skill: <strong>{selected.skillId?.name}</strong> • Level: {selected.currentLevel} → {selected.targetLevel} • {selected.weeklyHours} hrs/week
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--primary-400)' }}>
                    {selected.overallProgress}%
                  </div>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Total Progress</p>
                </div>
              </div>

              {/* Stage List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {selected.stages?.map((stage, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)',
                      background: stage.isCompleted ? 'rgba(34,197,94,0.06)' : 'var(--bg-glass)',
                      borderRadius: 'var(--radius-lg)', border: stage.isCompleted ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ flexShrink: 0, paddingTop: '3px' }}>
                      {stage.isCompleted ? (
                        <CheckCircle size={24} style={{ color: 'var(--success-500)' }} />
                      ) : (
                        <Circle size={24} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--font-base)' }}>{stage.title}</h3>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>~{stage.estimatedHours} Hours</span>
                      </div>
                      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                        {stage.description}
                      </p>
                      
                      {stage.topics?.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Topics: </span>
                          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{stage.topics.join(' • ')}</span>
                        </div>
                      )}

                      {stage.exercises?.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Practice Exercises: </span>
                          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{stage.exercises.join(' • ')}</span>
                        </div>
                      )}

                      {stage.miniProject && (
                        <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--accent-400)' }}>🏆 Mini Project: </span>
                          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>{stage.miniProject}</span>
                        </div>
                      )}

                      {!stage.isCompleted ? (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: 'var(--space-2)' }}
                          onClick={() => completeStage(selected._id, i)}
                        >
                          Mark Stage Complete ✓
                        </button>
                      ) : (
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--success-500)', fontWeight: 600 }}>
                          Completed on {stage.completedAt ? new Date(stage.completedAt).toLocaleDateString() : 'recently'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate AI Roadmap Modal */}
        {showCreate && (
          <div className="modal-overlay" onClick={() => !createLoading && setShowCreate(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                Generate AI Roadmap
              </h2>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                Our algorithm generates a complete curriculum broken into actionable stages and exercises.
              </p>

              <form onSubmit={handleCreateRoadmap}>
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Skill</label>
                  <select
                    className="form-select"
                    value={skillId}
                    onChange={e => setSkillId(e.target.value)}
                    required
                  >
                    {skills.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.category || 'General'})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Current Level</label>
                    <select
                      className="form-select"
                      value={currentLevel}
                      onChange={e => setCurrentLevel(e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Level</label>
                    <select
                      className="form-select"
                      value={targetLevel}
                      onChange={e => setTargetLevel(e.target.value)}
                    >
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Weekly Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    className="form-input"
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="form-label">Your Goals / Interests (Optional)</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="e.g. Master Katana forms or build production Python apps"
                    value={goals}
                    onChange={e => setGoals(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowCreate(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={createLoading}>
                    {createLoading ? 'Generating...' : 'Generate Roadmap'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;
