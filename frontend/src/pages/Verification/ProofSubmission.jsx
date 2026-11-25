import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, FileText, Link as LinkIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';

const ProofSubmission = () => {
  const [params] = useSearchParams();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ skillId: params.get('skillId') || '', userSkillId: params.get('userSkillId') || '', proofType: 'certificate', title: '', description: '', externalUrl: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchProofs(); }, []);

  const fetchProofs = async () => {
    try { const res = await api.get('/skill-proofs/my-proofs'); setProofs(res.data.data); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setMsg('');
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      if (file) fd.append('file', file);
      await api.post('/skill-proofs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Proof submitted successfully!'); setForm({ ...form, title: '', description: '', externalUrl: '' }); setFile(null); fetchProofs();
    } catch (err) { setMsg(err.response?.data?.error || 'Failed to submit proof'); }
    finally { setSubmitting(false); }
  };

  const statusIcon = { pending: <Clock size={16} style={{ color: 'var(--warning-500)' }} />, approved: <CheckCircle size={16} style={{ color: 'var(--success-500)' }} />, rejected: <XCircle size={16} style={{ color: 'var(--error-500)' }} /> };

  return (
    <div style={{ padding: 'var(--space-8) 0' }}><div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-8)' }}>Proof <span className="text-gradient">Submission</span></h1>

      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Submit New Proof</h2>
        {msg && <div style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-sm)', background: msg.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: msg.includes('Failed') ? 'var(--error-500)' : 'var(--success-500)' }}>{msg}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group"><label className="form-label">Proof Type</label>
            <select className="form-select" value={form.proofType} onChange={e => setForm({...form, proofType: e.target.value})}>
              <option value="certificate">Certificate</option><option value="portfolio">Portfolio/Project Link</option>
              <option value="course_completion">Course Completion</option><option value="project_link">Project Link</option><option value="other">Other</option>
            </select></div>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g., AWS Solutions Architect Certificate" /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe this proof..." /></div>
          <div className="form-group"><label className="form-label">External URL (optional)</label><input className="form-input" value={form.externalUrl} onChange={e => setForm({...form, externalUrl: e.target.value})} placeholder="https://..." /></div>
          <div className="form-group"><label className="form-label">Upload File (optional)</label><input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ color: 'var(--text-secondary)' }} /></div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Proof'}</button>
        </form>
      </div>

      <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>My Proofs</h2>
      {loading ? <div className="page-loading"><div className="spinner" /></div> : proofs.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No proofs submitted yet.</p> : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {proofs.map(p => (
            <div key={p._id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div><h3 style={{ fontWeight: 600 }}>{p.title}</h3><p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{p.proofType} • {p.skillId?.name} • {new Date(p.createdAt).toLocaleDateString()}</p>
                {p.reviewNotes && <p style={{ fontSize: 'var(--font-xs)', color: p.status === 'rejected' ? 'var(--error-500)' : 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>Note: {p.reviewNotes}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>{statusIcon[p.status]}<span className={`badge badge-${p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'error' : 'warning'}`}>{p.status}</span></div>
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
};

export default ProofSubmission;
