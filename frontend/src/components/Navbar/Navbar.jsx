import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  BookOpen,
  LogOut,
  User,
  LayoutDashboard,
  Bell,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobile}>
          <div className="navbar-logo-icon">
            <BookOpen size={22} />
          </div>
          <span className="navbar-logo-text">
            Skill<span className="text-gradient">Swap</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
          >
            About
          </Link>
          <Link
            to="/skills"
            className={`navbar-link ${isActive('/skills') ? 'active' : ''}`}
          >
            Explore Skills
          </Link>
        </div>

        {/* Right Side */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="btn btn-icon btn-ghost navbar-bell" title="Notifications">
                <Bell size={18} />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="btn btn-icon btn-ghost" title="Admin">
                  <Shield size={18} />
                </Link>
              )}
              <div className="navbar-user-menu">
                <button className="navbar-avatar-btn" title="Account">
                  <div className="avatar avatar-sm">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="navbar-user-name">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="navbar-dropdown">
                  <Link to="/dashboard" className="navbar-dropdown-item" onClick={closeMobile}>
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <Link to="/profile" className="navbar-dropdown-item" onClick={closeMobile}>
                    <User size={16} />
                    Profile
                  </Link>
                  <button className="navbar-dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-auth-actions">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="btn btn-icon btn-ghost navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-mobile">
          <Link to="/" className="navbar-mobile-link" onClick={closeMobile}>Home</Link>
          <Link to="/about" className="navbar-mobile-link" onClick={closeMobile}>About</Link>
          <Link to="/skills" className="navbar-mobile-link" onClick={closeMobile}>Explore Skills</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-mobile-link" onClick={closeMobile}>Dashboard</Link>
              <Link to="/profile" className="navbar-mobile-link" onClick={closeMobile}>Profile</Link>
              {isAdmin && (
                <Link to="/admin" className="navbar-mobile-link" onClick={closeMobile}>Admin</Link>
              )}
              <button className="navbar-mobile-link logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-mobile-link" onClick={closeMobile}>Sign In</Link>
              <Link to="/register" className="navbar-mobile-link" onClick={closeMobile}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
