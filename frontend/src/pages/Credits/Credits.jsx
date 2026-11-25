import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../services/api';

const Credits = () => {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [balRes, histRes] = await Promise.all([api.get('/credits/balance'), api.get('/credits/history')]);
        setBalance(balRes.data.data);
        setHistory(histRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ padding: 'var(--space-8) 0' }}><div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-8)' }}>Time <span className="text-gradient">Credits</span></h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <Wallet size={24} style={{ color: 'var(--primary-400)', margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>{balance?.creditBalance?.toFixed(1) || '0'}</p>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Current Balance</p>
        </div>
        <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <TrendingUp size={24} style={{ color: 'var(--success-500)', margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--success-500)' }}>{balance?.totalCreditsEarned?.toFixed(1) || '0'}</p>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Total Earned</p>
        </div>
        <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <TrendingDown size={24} style={{ color: 'var(--error-500)', margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--error-500)' }}>{balance?.totalCreditsSpent?.toFixed(1) || '0'}</p>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Total Spent</p>
        </div>
      </div>

      <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Transaction History</h2>
      {history.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No transactions yet.</p> : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {history.map(t => (
            <div key={t._id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {t.amount > 0 ? <ArrowUpRight size={20} style={{ color: 'var(--success-500)' }} /> : <ArrowDownRight size={20} style={{ color: 'var(--error-500)' }} />}
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{t.reason}</p>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{new Date(t.createdAt).toLocaleDateString()} • Balance: {t.balanceAfter?.toFixed(1)}</p>
                </div>
              </div>
              <span style={{ fontWeight: 700, color: t.amount > 0 ? 'var(--success-500)' : 'var(--error-500)' }}>{t.amount > 0 ? '+' : ''}{t.amount.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
};

export default Credits;
