import { useState, useEffect } from 'react';
import { Search, Star, Users, Globe, Shield, Calendar, Clock, ChevronDown, ChevronUp, CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Matching = () => {
  const navigate = useNavigate();
  const [skillId, setSkillId] = useState('');
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedBreakdown, setExpandedBreakdown] = useState({});

  // Booking Modal State
  const [bookingMentor, setBookingMentor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingDuration, setBookingDuration] = useState(60);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Load available skills on initial mount
  useEffect(() => {
    const loadInitialSkills = async () => {
      try {
        const res = await api.get('/skills');
        setSkills(res.data.data || []);
      } catch (e) {
        console.error('Failed to load skills', e);
      }
    };
    loadInitialSkills();
  }, []);

  const fetchSkillsList = async (search) => {
    try {
      const res = await api.get('/skills', { params: search ? { search } : {} });
      setSkills(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const findMatches = async () => {
    if (!skillId) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.post('/matching/find', { skillId });
      setMatches(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleBreakdown = (idx) => {
    setExpandedBreakdown(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleOpenBooking = (match) => {
    setBookingMentor(match);
    // default to tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setBookingDate(localIso);
    setBookingDuration(60);
    setBookingNotes('');
    setBookingSuccess(false);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      alert('Please choose a date and time');
      return;
    }
    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        mentorId: bookingMentor.mentor._id,
        skillId: skillId,
        scheduledAt: new Date(bookingDate).toISOString(),
        duration: parseInt(bookingDuration),
        notes: bookingNotes
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingMentor(null);
        navigate('/bookings');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Find <span className="text-gradient">Mentors</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
          AI-powered multi-factor matching evaluates skill relevance, proficiency, language alignment, availability, and reputation.
        </p>

        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <input
              className="form-input"
              placeholder="Search by skill name..."
              style={{ flex: 1, minWidth: '200px' }}
              onChange={e => fetchSkillsList(e.target.value)}
            />
            <select
              className="form-select"
              value={skillId}
              onChange={e => setSkillId(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              <option value="">Select skill to learn...</option>
              {skills.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.category || 'General'})</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={findMatches} disabled={!skillId || loading}>
              {loading ? 'Searching...' : <><Search size={16} /> Find Verified Mentors</>}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner spinner-lg" /></div>
        ) : searched && matches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Users size={48} style={{ opacity: 0.4, margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>No Verified Mentors Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              No other mentor has verified their status for this skill yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
            {matches.map((m, i) => (
              <div key={i} className="glass-card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  
                  {/* Left: Mentor Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 'var(--radius-xl)',
                      background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white', fontSize: 'var(--font-2xl)', fontWeight: 800,
                      boxShadow: 'var(--shadow-glow)'
                    }}>
                      {m.mentor.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <h3 style={{ fontWeight: 800, fontSize: 'var(--font-xl)' }}>{m.mentor.name}</h3>
                        <span className="badge badge-success" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shield size={12} /> Verified Mentor
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                        {m.mentor.bio || 'Verified expert ready to mentor and share knowledge.'}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--warning-500)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={13} fill="currentColor" /> {m.mentor.averageRating?.toFixed(1) || '5.0'} ({m.mentor.totalRatings || 0} reviews)
                        </span>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Zap size={13} style={{ color: 'var(--accent-400)' }} /> Rep: {m.mentor.reputationScore}
                        </span>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                          {m.mentor.completedSessions} completed sessions
                        </span>
                        {m.breakdown?.language?.commonLanguages?.length > 0 && (
                          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--success-500)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Globe size={13} /> {m.breakdown.language.commonLanguages.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Score & Actions */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
                      <span style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--primary-400)' }}>
                        {m.matchScore}%
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Matching Accuracy
                    </span>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleBreakdown(i)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Accuracy Breakdown {expandedBreakdown[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenBooking(m)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Calendar size={14} /> Book Session
                      </button>
                      <a href={`/messages?userId=${m.mentor._id}`} className="btn btn-ghost btn-sm">
                        Message
                      </a>
                    </div>
                  </div>
                </div>

                {/* Accuracy Breakdown Accordion */}
                {expandedBreakdown[i] && (
                  <div style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{ padding: 'var(--space-2)' }}>
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Skill Relevance (35%)</p>
                      <p style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--success-500)' }}>
                        {m.breakdown?.skillRelevance?.score || 100}% (Verified)
                      </p>
                    </div>
                    <div style={{ padding: 'var(--space-2)' }}>
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Proficiency (20%)</p>
                      <p style={{ fontSize: 'var(--font-base)', fontWeight: 700 }}>
                        {m.breakdown?.proficiency?.score || 80}% ({m.skill?.proficiencyLevel || 'Intermediate'})
                      </p>
                    </div>
                    <div style={{ padding: 'var(--space-2)' }}>
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Language (15%)</p>
                      <p style={{ fontSize: 'var(--font-base)', fontWeight: 700 }}>
                        {m.breakdown?.language?.score || 100}%
                      </p>
                    </div>
                    <div style={{ padding: 'var(--space-2)' }}>
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Availability (15%)</p>
                      <p style={{ fontSize: 'var(--font-base)', fontWeight: 700 }}>
                        {m.breakdown?.availability?.score || 70}%
                      </p>
                    </div>
                    <div style={{ padding: 'var(--space-2)' }}>
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Reliability & Rating (15%)</p>
                      <p style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--warning-500)' }}>
                        {m.breakdown?.reliability?.score || 95}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Book Session Modal */}
        {bookingMentor && (
          <div className="modal-overlay" onClick={() => !bookingLoading && setBookingMentor(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                Book Session with {bookingMentor.mentor.name}
              </h2>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                Schedule a 1-on-1 mentorship session. Credits will be exchanged automatically upon completion.
              </p>

              {bookingSuccess ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                  <CheckCircle size={48} style={{ color: 'var(--success-500)', margin: '0 auto var(--space-3)' }} />
                  <h3 style={{ fontWeight: 700 }}>Booking Request Sent!</h3>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                    Redirecting to your Bookings page...
                  </p>
                </div>
              ) : (
                <form onSubmit={submitBooking}>
                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="form-label">Session Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="form-label">Duration</label>
                    <select
                      className="form-select"
                      value={bookingDuration}
                      onChange={e => setBookingDuration(e.target.value)}
                    >
                      <option value={30}>30 Minutes (0.5 Credits)</option>
                      <option value={60}>60 Minutes (1.0 Credit)</option>
                      <option value={90}>90 Minutes (1.5 Credits)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                    <label className="form-label">Topic / Notes for Mentor (Optional)</label>
                    <textarea
                      className="form-input"
                      placeholder="What would you like to focus on during this session?"
                      value={bookingNotes}
                      onChange={e => setBookingNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setBookingMentor(null)}
                      disabled={bookingLoading}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                      {bookingLoading ? 'Requesting...' : 'Confirm & Request Booking'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
