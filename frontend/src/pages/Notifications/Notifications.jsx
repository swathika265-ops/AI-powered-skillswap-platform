import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import api from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try { const res = await api.get('/notifications'); setNotifications(res.data.data); setUnreadCount(res.data.unreadCount); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await api.patch(`/notifications/${id}/read`); fetchNotifications(); } catch (e) {}
  };

  const markAllRead = async () => {
    try { await api.patch('/notifications/read-all'); fetchNotifications(); } catch (e) {}
  };

  const typeIcons = { proof_approved: '✅', proof_rejected: '❌', assessment_result: '📋', booking_request: '📅', booking_confirmed: '✔️', booking_cancelled: '🚫', booking_completed: '🎉', meeting_link: '🔗', new_message: '💬', credit_earned: '💰', credit_spent: '💸', reputation_change: '⭐', new_review: '📝', admin_action: '🛡️', system: '🔔' };

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ padding: 'var(--space-8) 0' }}><div className="container" style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}><span className="text-gradient">Notifications</span></h1>
        {unreadCount > 0 && <button className="btn btn-outline btn-sm" onClick={markAllRead}><CheckCheck size={14} /> Mark all read ({unreadCount})</button>}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <Bell size={48} style={{ opacity: 0.4, margin: '0 auto var(--space-4)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {notifications.map(n => (
            <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
              className="card" style={{ padding: 'var(--space-4)', cursor: n.isRead ? 'default' : 'pointer', display: 'flex', gap: 'var(--space-3)', alignItems: 'start', opacity: n.isRead ? 0.6 : 1, borderLeft: n.isRead ? 'none' : '3px solid var(--primary-500)' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{typeIcons[n.type] || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{n.title}</p>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{n.message}</p>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-500)', flexShrink: 0, marginTop: 6 }} />}
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
};

export default Notifications;
