import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (activeConv) { fetchMessages(activeConv._id); const interval = setInterval(() => fetchMessages(activeConv._id), 5000); return () => clearInterval(interval); }
  }, [activeConv]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try { const res = await api.get('/messages/conversations'); setConversations(res.data.data); if (res.data.data.length > 0 && !activeConv) setActiveConv(res.data.data[0]); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchMessages = async (convId) => {
    try { const res = await api.get(`/messages/${convId}`); setMessages(res.data.data); } catch (e) {}
  };

  const sendMessage = async (e) => {
    e.preventDefault(); if (!newMsg.trim() || !activeConv) return;
    try { await api.post(`/messages/${activeConv._id}`, { content: newMsg }); setNewMsg(''); fetchMessages(activeConv._id); }
    catch (e) { console.error(e); }
  };

  const getOtherUser = (conv) => conv.participants?.find(p => p._id !== user?._id);

  return (
    <div style={{ padding: 'var(--space-8) 0' }}><div className="container">
      <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}><span className="text-gradient">Messages</span></h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-4)', height: '65vh' }}>
        {/* Conversation list */}
        <div className="card" style={{ overflowY: 'auto' }}>
          {loading ? <div className="page-loading"><div className="spinner" /></div> : conversations.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}><MessageCircle size={32} style={{ opacity: 0.4 }} /><p>No conversations yet</p></div>
          ) : conversations.map(c => {
            const other = getOtherUser(c);
            return (
              <div key={c._id} onClick={() => setActiveConv(c)}
                style={{ padding: 'var(--space-4)', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', background: activeConv?._id === c._id ? 'var(--bg-glass)' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>{other?.name?.charAt(0)}</div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{other?.name}</p>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage || 'Start a conversation'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          {activeConv ? (<>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
              {getOtherUser(activeConv)?.name}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {messages.map(m => (
                <div key={m._id} style={{ alignSelf: m.senderId === user?._id ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', background: m.senderId === user?._id ? 'var(--primary-600)' : 'var(--bg-glass)', color: m.senderId === user?._id ? 'white' : 'var(--text-primary)', fontSize: 'var(--font-sm)' }}>
                    {m.content}
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', textAlign: m.senderId === user?._id ? 'right' : 'left' }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 'var(--space-3)' }}>
              <input className="form-input" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..." style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary"><Send size={16} /></button>
            </form>
          </>) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>Select a conversation</div>}
        </div>
      </div>
    </div></div>
  );
};

export default Messages;
