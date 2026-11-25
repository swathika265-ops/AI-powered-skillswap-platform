import { Link } from 'react-router-dom';
import { BookOpen, Globe, Mail, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <BookOpen size={18} />
              </div>
              <span className="footer-logo-text">
                Skill<span className="text-gradient">Swap</span>
              </span>
            </Link>
            <p className="footer-tagline">
              AI-Powered Skill Exchange and Verified Collaborative Learning Platform.
            </p>
          </div>

          {/* Platform Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <Link to="/about" className="footer-link">How It Works</Link>
            <Link to="/skills" className="footer-link">Explore Skills</Link>
            <Link to="/register" className="footer-link">Get Started</Link>
          </div>

          {/* Features */}
          <div className="footer-col">
            <h4 className="footer-col-title">Features</h4>
            <span className="footer-link">Skill Verification</span>
            <span className="footer-link">AI Matching</span>
            <span className="footer-link">Time Credits</span>
            <span className="footer-link">Learning Roadmaps</span>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <a href="mailto:support@skillswap.com" className="footer-link">
              <Mail size={14} /> support@skillswap.com
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} SkillSwap. Built with{' '}
            <Heart size={12} className="footer-heart" /> for collaborative learning.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
