import { useState } from 'react';
import HandGesture from '../../assets/hand-gesture.png';

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState<'guest' | 'intern'>('guest');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: { role: 'user'; content: string } = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, role, history: messages }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const data = await response.json();
      const botMessage: { role: 'bot'; content: string } = { role: 'bot', content: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Error: Could not get response.' }]);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-sidebar-left">
        <div className="chatbot-sidebar-content">
          <h2 className="chatbot-sidebar-title">Explore Our Projects</h2>
          <ul className="chatbot-sidebar-links">
            <li><button className="chatbot-sidebar-link" onClick={() => setInput('What are the current projects?')}>Current Projects</button></li>
            <li><button className="chatbot-sidebar-link" onClick={() => setInput('How can I contribute?')}>Contribute to Projects</button></li>
            <li><button className="chatbot-sidebar-link" onClick={() => setInput('Tell me about COSMO')}>About COSMO</button></li>
            <li><button className="chatbot-sidebar-link" onClick={() => setInput('Tell me about management')}>Management</button></li>
            <li><button className="chatbot-sidebar-link" onClick={() => setInput('Tell me about the interns')}>Interns</button></li>
            <li><button className="chatbot-sidebar-link" onClick={() => setInput('How can I partner with the center for industry solutions')}>Become a partner</button></li>
          </ul>
        </div>
      </div>
      <div className="chatbot-main">
        <div className="chatbot-header">
          <h1 className="chatbot-title">
            COSMO
            <span className="chatbot-version"> v1.0</span>
          </h1>
          <div className="chatbot-mode">
            <label className="chatbot-label">Mode:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'guest' | 'intern')}
              className="chatbot-select"
            >
              <option value="guest">Guest</option>
              <option value="intern">Intern</option>
            </select>
          </div>
        </div>
        <div className="chatbot-container">
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chatbot-message ${m.role}`}
              >
                <div className="chatbot-bubble">{m.content}</div>
              </div>
            ))}
          </div>
          <div className="chatbot-input-group">
            <input
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask COSMO about our projects..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="chatbot-send"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
        <div className="chatbot-footer">
          <img
            src={HandGesture}
            alt="Spurs up hand gesture"
            className="chatbot-hand-gesture"
          />
        </div>
      </div>
      <div className="chatbot-sidebar-right">
        <div className="chatbot-sidebar-content">
          <h2 className="chatbot-sidebar-title">COSMO Status</h2>
          <div className="chatbot-status-indicator">
            <span className="chatbot-status-dot"></span>
            <span>Online</span>
          </div>
          <p className="chatbot-sidebar-text">COSMO is ready to answer your questions about our latest projects!</p>
          <div className="chatbot-sidebar-updates">
            <h3 className="chatbot-sidebar-subtitle">Recent Updates</h3>
            <p className="chatbot-sidebar-text">• Project Alpha: New AI module deployed</p>
            <p className="chatbot-sidebar-text">• Project Beta: Testing phase started</p>
          </div>
        </div>
      </div>
    </div>
  );
}