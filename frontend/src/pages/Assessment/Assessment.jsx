import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, Shield, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

const Assessment = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const skillId = params.get('skillId');
  const userSkillId = params.get('userSkillId');

  const [step, setStep] = useState('intro'); // intro, quiz, result
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [violations, setViolations] = useState(0);
  const [maxViolations, setMaxViolations] = useState(3);
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoFailed, setAutoFailed] = useState(false);
  const timerRef = useRef(null);

  // Anti-cheat: detect tab switches
  useEffect(() => {
    if (step !== 'quiz') return;
    const handleVisibility = async () => {
      if (document.hidden && attemptId) {
        try {
          const res = await api.post(`/assessments/${attemptId}/violation`, { eventType: 'tab_switch', details: { timestamp: new Date().toISOString() } });
          setViolations(res.data.violations);
          if (res.data.autoFailed) { setAutoFailed(true); setStep('result'); setResult({ passed: false, percentage: 0, message: 'Auto-failed due to violations' }); }
        } catch (e) { console.error(e); }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [step, attemptId]);

  // Timer
  useEffect(() => {
    if (step !== 'quiz' || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { handleSubmit(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step, timeLeft]);

  const startAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/assessments/start', { skillId, userSkillId });
      const d = res.data.data;
      setAttemptId(d.attemptId); setQuestions(d.questions); setDuration(d.duration);
      setMaxViolations(d.maxViolations); setTimeLeft(d.duration * 60); setStep('quiz');
    } catch (err) { alert(err.response?.data?.error || 'Cannot start assessment'); }
    finally { setLoading(false); }
  };

  const selectAnswer = async (questionId, answerIdx) => {
    setAnswers({ ...answers, [questionId]: answerIdx });
    try { await api.post(`/assessments/${attemptId}/answer`, { questionId, selectedAnswer: answerIdx }); } catch (e) { console.error(e); }
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const res = await api.post(`/assessments/${attemptId}/submit`);
      setResult(res.data.data); setStep('result');
    } catch (err) { alert(err.response?.data?.error || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (step === 'intro') {
    return (
      <div style={{ padding: 'var(--space-8) 0' }}><div className="container" style={{ maxWidth: '700px' }}>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>Skill <span className="text-gradient">Assessment</span></h1>
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Before You Begin</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            <p>⏱ You have <strong>30 minutes</strong> to complete the assessment.</p>
            <p>📋 Questions are multiple-choice, graded server-side.</p>
            <p>✅ Pass mark: <strong>70%</strong></p>
            <p>🚨 <strong>Anti-cheating:</strong> Tab switches and window changes are tracked.</p>
            <p>❌ After <strong>3 violations</strong>, the assessment auto-fails.</p>
            <p>🔒 Switching tabs, minimizing, or leaving this page counts as a violation.</p>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.1)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)' }}>
            <p style={{ color: 'var(--error-500)', fontSize: 'var(--font-sm)', fontWeight: 600 }}><AlertTriangle size={16} style={{ verticalAlign: 'middle' }} /> Once started, you cannot pause or restart this attempt.</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={startAssessment} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Starting...' : 'Start Assessment'}
          </button>
        </div>
      </div></div>
    );
  }

  if (step === 'result') {
    return (
      <div style={{ padding: 'var(--space-8) 0' }}><div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 'var(--space-12)' }}>
          {result?.passed ? <CheckCircle size={64} style={{ color: 'var(--success-500)', margin: '0 auto var(--space-6)' }} /> : <XCircle size={64} style={{ color: 'var(--error-500)', margin: '0 auto var(--space-6)' }} />}
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>{autoFailed ? 'Auto-Failed' : result?.passed ? 'Congratulations!' : 'Not Passed'}</h1>
          <p style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: result?.passed ? 'var(--success-500)' : 'var(--error-500)', marginBottom: 'var(--space-4)' }}>{result?.percentage || 0}%</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>Score: {result?.obtainedMarks} / {result?.totalMarks}</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Violations: {result?.violations || violations}</p>
          {result?.passed ? <p style={{ color: 'var(--success-500)', fontWeight: 600 }}>Your skill is now verified! You can teach this skill.</p>
            : <p style={{ color: 'var(--text-secondary)' }}>Required: {result?.passThreshold || 70}%. You can retry after the cooldown period.</p>}
          <button className="btn btn-primary" onClick={() => navigate('/my-skills')} style={{ marginTop: 'var(--space-6)' }}>Back to My Skills</button>
        </div>
      </div></div>
    );
  }

  // Quiz step
  const q = questions[currentQ];
  return (
    <div style={{ padding: 'var(--space-8) 0' }}><div className="container" style={{ maxWidth: '800px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <span style={{ fontWeight: 700 }}>Q {currentQ + 1} / {questions.length}</span>
        <span style={{ color: timeLeft < 120 ? 'var(--error-500)' : 'var(--text-secondary)', fontWeight: 700, fontSize: 'var(--font-lg)' }}><Clock size={18} style={{ verticalAlign: 'middle' }} /> {formatTime(timeLeft)}</span>
        <span style={{ color: violations > 0 ? 'var(--error-500)' : 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>Violations: {violations}/{maxViolations}</span>
      </div>

      {/* Question */}
      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>{q?.question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {q?.options?.map((opt, idx) => (
            <button key={idx} onClick={() => selectAnswer(q._id, idx)}
              style={{ textAlign: 'left', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: answers[q._id] === idx ? '2px solid var(--primary-500)' : '2px solid var(--border-default)', background: answers[q._id] === idx ? 'rgba(108,43,217,0.1)' : 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--font-sm)', transition: 'all 0.2s' }}>
              <span style={{ fontWeight: 600, marginRight: 'var(--space-3)' }}>{String.fromCharCode(65 + idx)}.</span>{opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <button className="btn btn-ghost" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>Previous</button>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)} style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--font-xs)', fontWeight: 600, background: answers[questions[i]._id] !== undefined ? 'var(--primary-500)' : i === currentQ ? 'var(--border-strong)' : 'var(--bg-glass)', color: answers[questions[i]._id] !== undefined ? 'white' : 'var(--text-secondary)' }}>{i + 1}</button>
          ))}
        </div>
        {currentQ < questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>Next</button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Assessment'}</button>
        )}
      </div>
    </div></div>
  );
};

export default Assessment;
