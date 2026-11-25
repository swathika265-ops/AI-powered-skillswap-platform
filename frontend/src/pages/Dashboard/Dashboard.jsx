import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Award, Clock, Star, TrendingUp, Calendar,
  MessageCircle, Target, Users, ChevronRight, Wallet, Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/user');
        setAnalytics(res.data.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="page-loading"><div className="spinner spinner-lg" /><p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p></div>;
  }

  const stats = [
    { icon: <Wallet size={20} />, label: 'Credit Balance', value: user?.creditBalance?.toFixed(1) || '0', color: 'var(--primary-400)' },
    { icon: <Shield size={20} />, label: 'Reputation', value: `${user?.reputationScore || 50}/100`, color: 'var(--accent-400)' },
    { icon: <Star size={20} />, label: 'Avg Rating', value: user?.averageRating?.toFixed(1) || '0.0', color: 'var(--warning-500)' },
    { icon: <Calendar size={20} />, label: 'Sessions', value: analytics?.completedSessions || user?.completedSessions || 0, color: 'var(--success-500)' },
  ];

  const quickActions = [
    { icon: <BookOpen size={20} />, label: 'Explore Skills', to: '/skills', desc: 'Discover new skills to learn' },
    { icon: <Users size={20} />, label: 'Find Mentors', to: '/matching', desc: 'AI-powered mentor matching' },
    { icon: <Target size={20} />, label: 'My Skills', to: '/my-skills', desc: 'Manage learning & teaching skills' },
    { icon: <Calendar size={20} />, label: 'Bookings', to: '/bookings', desc: 'View upcoming sessions' },
    { icon: <MessageCircle size={20} />, label: 'Messages', to: '/messages', desc: 'Chat with mentors & learners' },
    { icon: <TrendingUp size={20} />, label: 'Roadmaps', to: '/roadmaps', desc: 'AI learning roadmaps' },
    { icon: <Award size={20} />, label: 'Challenges', to: '/challenges', desc: 'Join skill challenges' },
    { icon: <Clock size={20} />, label: 'Credits', to: '/credits', desc: 'View credit transactions' },
  ];

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome */}
        <div className="dashboard-welcome">
          <div>
            <h1 className="dashboard-title">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="dashboard-subtitle">Here's your learning and teaching overview</p>
          </div>
          <div className="dashboard-role-badge">
            <span className={`badge badge-${user?.role === 'admin' ? 'error' : user?.role === 'mentor' ? 'primary' : 'info'}`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card glass-card">
              <div className="stat-icon" style={{ color: stat.color, background: `${stat.color}15` }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2 className="section-heading">Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to} className="action-card glass-card">
                <div className="action-icon">{action.icon}</div>
                <div className="action-info">
                  <span className="action-label">{action.label}</span>
                  <span className="action-desc">{action.desc}</span>
                </div>
                <ChevronRight size={16} className="action-arrow" />
              </Link>
            ))}
          </div>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="dashboard-section">
            <h2 className="section-heading">Activity Summary</h2>
            <div className="summary-grid">
              <div className="summary-card card">
                <h3>Teaching</h3>
                <p className="summary-value">{analytics.teachingHours || 0} sessions</p>
                <p className="summary-sub">Credits earned: {user?.totalCreditsEarned?.toFixed(1) || 0}</p>
              </div>
              <div className="summary-card card">
                <h3>Learning</h3>
                <p className="summary-value">{analytics.learningHours || 0} sessions</p>
                <p className="summary-sub">Credits spent: {user?.totalCreditsSpent?.toFixed(1) || 0}</p>
              </div>
              <div className="summary-card card">
                <h3>Upcoming</h3>
                <p className="summary-value">{analytics.upcomingBookings || 0} sessions</p>
                <p className="summary-sub">Scheduled ahead</p>
              </div>
              <div className="summary-card card">
                <h3>Challenges</h3>
                <p className="summary-value">{analytics.challengesCompleted || 0} completed</p>
                <p className="summary-sub">Keep growing!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
