import { Link } from 'react-router-dom';
import { ShieldX, Home, LogIn } from 'lucide-react';

const AccessDenied = () => {
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
      <ShieldX size={64} style={{ color: 'var(--error-500)', marginBottom: 'var(--space-6)' }} />
      <h1 style={{
        fontSize: 'var(--font-4xl)',
        fontWeight: 800,
        marginBottom: 'var(--space-4)',
      }}>
        Access Denied
      </h1>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-8)',
        maxWidth: '400px',
      }}>
        You don't have permission to access this page. Please log in with an authorized account.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          Go Home
        </Link>
        <Link to="/login" className="btn btn-secondary">
          <LogIn size={16} />
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
