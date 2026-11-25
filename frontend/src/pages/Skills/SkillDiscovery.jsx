import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Plus, Star } from 'lucide-react';
import api from '../../services/api';

const SkillDiscovery = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const [skillsRes, catsRes] = await Promise.all([
          api.get('/skills', { params: { search, category } }),
          api.get('/skills/categories'),
        ]);
        setSkills(skillsRes.data.data);
        setCategories(catsRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSkills();
  }, [search, category]);

  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>
          Explore <span className="text-gradient">Skills</span>
        </h1>

        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
          <div className="input-with-icon" style={{ flex: 1, minWidth: '250px' }}>
            <Search size={18} className="input-icon" />
            <input className="form-input" placeholder="Search skills..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '44px' }} />
          </div>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner spinner-lg" /></div>
        ) : skills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-secondary)' }}>
            <BookOpen size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
            <p>No skills found. Try a different search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {skills.map(skill => (
              <div key={skill._id} className="glass-card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{skill.name}</h3>
                  <span className={`badge badge-${skill.difficulty === 'beginner' ? 'success' : skill.difficulty === 'advanced' ? 'warning' : 'primary'}`}>
                    {skill.difficulty}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-3)' }}>
                  {skill.description || 'No description available'}
                </p>
                <span className="badge badge-info" style={{ marginBottom: 'var(--space-4)', display: 'inline-block' }}>{skill.category}</span>
                {skill.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                    {skill.tags.map(t => <span key={t} style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', background: 'var(--bg-glass)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDiscovery;
