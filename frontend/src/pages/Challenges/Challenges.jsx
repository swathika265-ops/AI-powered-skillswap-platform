import { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, CheckCircle, ExternalLink, Send, Award, Clock } from 'lucide-react';
import api from '../../services/api';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit modal state
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chalRes, subRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/submissions/my')
      ]);
      setChallenges(chalRes.data.data || []);
      setMySubmissions(subRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (id) => {
    try {
      await api.post(`/challenges/${id}/join`);
      alert('Joined challenge successfully! You can now submit your project.');
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to join challenge');
    }
  };

  const handleOpenSubmit = (submission) => {
    setActiveSubmission(submission);
    setProjectUrl(submission.projectUrl || '');
    setSubmissionNotes(submission.description || '');
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!projectUrl) return;
    setSubmitting(true);
    try {
      await api.patch(`/submissions/${activeSubmission._id}`, {
        projectUrl,
        description: submissionNotes
      });
      alert('Project solution submitted for review! Admin/peer will verify.');
      setActiveSubmission(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  // Find user submission for a given challenge
  const getSubmissionForChallenge = (challengeId) => {
    return mySubmissions.find(s => s.challengeId?._id === challengeId || s.challengeId === challengeId);
  };

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Skill <span className="text-gradient">Challenges</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
          Compete in hands-on practical challenges, showcase your skills, and earn credits & reputation XP!
        </p>

        {challenges.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Trophy size={48} style={{ opacity: 0.4, margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>No active challenges right now</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Check back soon for upcoming hackathons and skill challenges!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
            {challenges.map(c => {
              const submission = getSubmissionForChallenge(c._id);
              const isJoined = !!submission;
              const isSubmitted = submission && submission.status === 'submitted';
              const isApproved = submission && submission.status === 'approved';

              return (
                <div key={c._id} className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                      <span className={`badge badge-${c.difficulty === 'beginner' ? 'success' : c.difficulty === 'advanced' ? 'error' : 'warning'}`}>
                        {c.difficulty}
                      </span>
                      {c.rewardCredits > 0 && (
                        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Award size={13} /> {c.rewardCredits} Credits Reward
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{c.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                      {c.description}
                    </p>

                    {c.guidelines?.length > 0 && (
                      <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--accent-400)', marginBottom: '4px' }}>
                          Guidelines:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                          {c.guidelines.map((g, gi) => <li key={gi} style={{ marginBottom: '2px' }}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                      <span><Users size={13} /> {c.participantCount} Joined</span>
                      {c.deadline && (
                        <span><Calendar size={13} /> Due: {new Date(c.deadline).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Action buttons based on status */}
                    {!isJoined ? (
                      <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => joinChallenge(c._id)}>
                        Join Challenge
                      </button>
                    ) : isApproved ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--success-500)', fontSize: 'var(--font-sm)', fontWeight: 700 }}>
                        <CheckCircle size={16} /> Solution Approved & Credits Claimed!
                      </div>
                    ) : isSubmitted ? (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ flex: 1, borderColor: 'var(--primary-400)', color: 'var(--primary-300)' }}
                          onClick={() => handleOpenSubmit(submission)}
                        >
                          ✓ Submitted (Update Link)
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => handleOpenSubmit(submission)}
                      >
                        <Send size={14} /> Submit Project Solution
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Solution Modal */}
        {activeSubmission && (
          <div className="modal-overlay" onClick={() => !submitting && setActiveSubmission(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                Submit Project Solution
              </h2>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                Provide a GitHub repository, live URL, or video demonstration link of your work.
              </p>

              <form onSubmit={handleSubmitSolution}>
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Project URL (GitHub / Demo / Video)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/username/project or live link"
                    value={projectUrl}
                    onChange={e => setProjectUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="form-label">Notes & Implementation Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Briefly describe your approach, technologies used, and how you met the guidelines..."
                    value={submissionNotes}
                    onChange={e => setSubmissionNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setActiveSubmission(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Solution'}
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

export default Challenges;
