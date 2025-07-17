import { useState } from 'react';

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
      <div className="chatbot-container">
        <h1 className="chatbot-title">Lab Assistant</h1>

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
  );
}
