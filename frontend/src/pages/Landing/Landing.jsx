import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Users,
  Shield,
  Brain,
  Globe,
  Star,
  Zap,
  Award,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Shield size={28} />,
      title: 'Verified Skills',
      description: 'Every teaching skill is verified through proof submission, admin review, and skill-specific assessments.',
      color: 'var(--primary-400)',
    },
    {
      icon: <Brain size={28} />,
      title: 'AI-Powered Matching',
      description: 'Smart algorithms match you with the perfect mentor based on skills, language, availability, and more.',
      color: 'var(--accent-400)',
    },
    {
      icon: <Globe size={28} />,
      title: 'Multilingual Support',
      description: 'Real-time translation, voice input, and spoken replies — learn and teach in any supported language.',
      color: 'var(--success-500)',
    },
    {
      icon: <Zap size={28} />,
      title: 'Time Credits',
      description: 'Teach to earn credits, spend credits to learn. Fair, balanced skill exchange for everyone.',
      color: 'var(--warning-500)',
    },
    {
      icon: <Award size={28} />,
      title: 'Reputation System',
      description: 'Build your reputation through reliability, great reviews, and consistent participation.',
      color: 'var(--error-500)',
    },
    {
      icon: <TrendingUp size={28} />,
      title: 'AI Learning Roadmaps',
      description: 'Personalized learning paths with milestones, practice exercises, and progress tracking.',
      color: 'var(--primary-300)',
    },
  ];

  const steps = [
    { number: '01', title: 'Create Your Profile', desc: 'Sign up, set your skills, languages, and learning preferences.' },
    { number: '02', title: 'Verify Your Skills', desc: 'Submit proofs, get admin approval, pass the skill assessment.' },
    { number: '03', title: 'Find Your Match', desc: 'AI matches you with verified mentors based on your goals.' },
    { number: '04', title: 'Learn & Teach', desc: 'Book sessions, join meetings, exchange skills, and grow together.' },
  ];

  const stats = [
    { value: '∞', label: 'Skills to Exchange' },
    { value: '70%', label: 'Pass Mark Standard' },
    { value: '1:1', label: 'Credit per Hour' },
    { value: '24/7', label: 'Platform Access' },
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="container hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>AI-Powered Skill Exchange Platform</span>
          </div>

          <h1 className="hero-title">
            Learn Any Skill.{' '}
            <span className="text-gradient">Teach Your Best.</span>
            <br />
            Grow Together.
          </h1>

          <p className="hero-subtitle">
            SkillSwap connects verified mentors with eager learners through AI-powered matching,
            real-time collaboration, and a fair time-credit system. Every teaching skill is
            rigorously verified.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/about" className="btn btn-secondary btn-lg">
                  How It Works
                </Link>
              </>
            )}
          </div>

          {/* Stats Bar */}
          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">
              Everything You Need to{' '}
              <span className="text-gradient">Excel</span>
            </h2>
            <p className="section-subtitle">
              A complete platform for verified skill exchange with AI assistance at every step.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card glass-card">
                <div
                  className="feature-icon"
                  style={{ color: feature.color, background: `${feature.color}15` }}
                >
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">
              Four Steps to{' '}
              <span className="text-gradient">Start Learning</span>
            </h2>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={step.number} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                {index < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Highlight */}
      <section className="verify-section">
        <div className="container">
          <div className="verify-card glass-card">
            <div className="verify-content">
              <Shield size={40} className="verify-icon" />
              <h2 className="verify-title">
                Rigorous Skill Verification
              </h2>
              <p className="verify-desc">
                Teaching on SkillSwap requires verified expertise. Our three-step verification
                ensures quality:
              </p>
              <ul className="verify-list">
                <li>
                  <CheckCircle2 size={18} />
                  <span>Submit at least 2 distinct proofs per teaching skill</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>Admin reviews and approves each proof independently</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>Pass a skill-specific assessment (70% minimum)</span>
                </li>
              </ul>
              <div className="verify-badges">
                <span className="badge badge-success">Verified Mentors Only</span>
                <span className="badge badge-info">Anti-Cheat Protected</span>
                <span className="badge badge-primary">AI-Monitored</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">
              Ready to Start Your{' '}
              <span className="text-gradient">Learning Journey?</span>
            </h2>
            <p className="cta-desc">
              Join SkillSwap today and connect with verified mentors worldwide.
              Teach what you know, learn what you love.
            </p>
            {!isAuthenticated && (
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Account
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
