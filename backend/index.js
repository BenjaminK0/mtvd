const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Load flat-file knowledge base for RAG
const dataPath = path.join(__dirname, 'lab_knowledge.json');
const knowledge = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

function retrieveContext(query) {
  const relevantChunks = knowledge.filter(k => query.toLowerCase().includes(k.tag.toLowerCase()));
  return relevantChunks.map(k => k.text).join('\n');
}

app.post('/api/chat', async (req, res) => {
  const { message, role, history } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const historyContext = (history || [])
      .map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`)
      .join('\n');

    const ragContext = retrieveContext(message);
    const prompt = `You are a helpful lab assistant.\n
Role: ${role.toUpperCase()}\n
Relevant Info:\n${ragContext}\n
Conversation:\n${historyContext}\n
User: ${message}`;

    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;

    res.json({ reply: response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Something went wrong. Please try again.' });
  }
});


app.listen(5000, () => console.log('Server running on port 5000'));