import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: 'var(--space-8)',
    }}>
      <h1 style={{
        fontSize: '8rem',
        fontWeight: 900,
        background: 'var(--gradient-text)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1,
        marginBottom: 'var(--space-4)',
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: 'var(--font-2xl)',
        fontWeight: 700,
        marginBottom: 'var(--space-4)',
      }}>
        Page Not Found
      </h2>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-8)',
        maxWidth: '400px',
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          Go Home
        </Link>
        <button onClick={() => window.history.back()} className="btn btn-secondary">
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
