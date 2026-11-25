import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, ExternalLink, Video, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings', { params: { status: filter || undefined } });
      setBookings(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, extra = {}) => {
    try {
      await api.patch(`/bookings/${id}/${action}`, extra);
      fetchBookings();
    } catch (e) {
      alert(e.response?.data?.error || 'Action failed');
    }
  };

  const addMeetingLink = async (id) => {
    const defaultUrl = 'https://meet.google.com/new';
    const url = prompt('Enter meeting URL (Google Meet, Zoom, or Teams):', defaultUrl);
    if (!url) return;
    try {
      await api.patch(`/bookings/${id}/meeting-link`, { meetingUrl: url });
      fetchBookings();
    } catch (e) {
      alert(e.response?.data?.error || 'Invalid meeting URL');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await api.post('/api/reviews', {
        bookingId: reviewBooking._id,
        rating: parseInt(rating),
        comment: reviewComment
      });
      alert('Review submitted successfully! Reputation & rating updated.');
      setReviewBooking(null);
      setReviewComment('');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const statusColors = {
    pending: 'warning',
    confirmed: 'primary',
    cancelled: 'error',
    completed: 'success',
    no_show: 'error'
  };

  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}>
            My <span className="text-gradient">Bookings</span>
          </h1>
          <a href="/matching" className="btn btn-primary btn-sm">
            + Find Mentors & Book
          </a>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(s)}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner spinner-lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Calendar size={48} style={{ opacity: 0.4, margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>No bookings found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Ready to learn something new? Search for verified mentors and book a session!
            </p>
            <a href="/matching" className="btn btn-primary btn-sm">Browse Mentors</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {bookings.map(b => {
              const isMentor = b.mentorId?._id === user?._id;
              const otherPerson = isMentor ? b.learnerId : b.mentorId;
              return (
                <div key={b._id} className="card" style={{ padding: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--font-lg)' }}>{b.skillId?.name || 'Session'}</h3>
                        <span className={`badge badge-${statusColors[b.status]}`}>{b.status}</span>
                      </div>
                      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                        {isMentor ? 'Learner' : 'Mentor'}: <strong>{otherPerson?.name || 'User'}</strong> ({otherPerson?.email})
                      </p>
                      {b.notes && (
                        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)', fontStyle: 'italic' }}>
                          "{b.notes}"
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {new Date(b.scheduledAt).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({b.duration} mins)
                        </span>
                        <span>💰 {b.creditAmount} credits</span>
                      </div>
                      {b.meetingUrl && (
                        <div style={{ marginTop: 'var(--space-3)' }}>
                          <a
                            href={b.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-300)' }}
                          >
                            <Video size={14} /> Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {isMentor && b.status === 'pending' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAction(b._id, 'confirm')}>
                            Confirm Booking
                          </button>
                        )}
                        {isMentor && b.status === 'confirmed' && !b.meetingUrl && (
                          <button className="btn btn-outline btn-sm" onClick={() => addMeetingLink(b._id)}>
                            Add Meeting Link
                          </button>
                        )}
                        {isMentor && b.status === 'confirmed' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAction(b._id, 'complete')}>
                            Mark Completed
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(b.status) && (
                          <button className="btn btn-ghost btn-sm" onClick={() => handleAction(b._id, 'cancel')}>
                            Cancel
                          </button>
                        )}
                        {!isMentor && b.status === 'completed' && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => { setReviewBooking(b); setRating(5); setReviewComment(''); }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--warning-500)' }}
                          >
                            <Star size={13} fill="currentColor" /> Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {reviewBooking && (
          <div className="modal-overlay" onClick={() => !reviewLoading && setReviewBooking(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                Rate & Review Session
              </h2>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Your feedback affects the mentor's reliability rating and matching score.
              </p>

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                          color: star <= rating ? 'var(--warning-500)' : 'var(--text-tertiary)'
                        }}
                      >
                        <Star size={28} fill={star <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="form-label">Feedback / Comment</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="How was the session? Did you learn effectively?"
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setReviewBooking(null)}
                    disabled={reviewLoading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
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

export default Bookings;
