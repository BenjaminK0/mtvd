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
        <div className="chatbot-left-half">
                <h1 className='chatbot-intro'>Introducing C4iS AI Assistant...</h1>
                    <h2 className="chatbot-right-header">COSMO</h2>
                    <h3 className='chatbot-subheader'>Ask COSMO what projects we are working on!</h3>
                <img src={ HandGesture } alt="spurs up hand gesture" className='handGesture' />
        </div>
        <div className="chatbot-container">
            <div className="chatbot-right-half">
                <h1 className="chatbot-title">COSMO <span className="versionColor">v1.0</span></h1>

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

                <div className="chatbot-messages">
                {messages.map((m, i) => (
                    <div key={i} className={`chatbot-message ${m.role}`}>
                    <span className="chatbot-bubble">{m.content}</span>
                    </div>
                ))}
                </div>

                <div className="chatbot-input-group">
                <input
                    className="chatbot-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="chatbot-send" onClick={sendMessage}>
                    Send
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
