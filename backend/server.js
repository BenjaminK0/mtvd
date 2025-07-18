const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect('mongodb://localhost:27017/devices', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Device Schema
const deviceSchema = new mongoose.Schema({
  name: String,
  location: String,
  status: String,
});
const Device = mongoose.model('Device', deviceSchema);

// Device Routes
app.get('/devices', async (req, res) => {
  const devices = await Device.find();
  res.json(devices);
});
app.post('/devices', async (req, res) => {
  const saved = await new Device(req.body).save();
  res.json(saved);
});
app.put('/devices/:id', async (req, res) => {
  const updated = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});
app.delete('/devices/:id', async (req, res) => {
  await Device.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Gemini + Supabase Setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function retrieveContext(query) {
  const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });

  const embeddingResult = await embeddingModel.embedContent({
    content: {
      parts: [{ text: query }],
    },
    taskType: 'retrieval_query',
  });

  const queryEmbedding = embeddingResult.embedding.values;

  const { data, error } = await supabase.rpc('match_rag_docs', {
    query_embedding: queryEmbedding,
    match_threshold: 0.75,  // 👈 REQUIRED
    match_count: 5,
  });

  if (error) {
    console.error('Supabase match_rag_docs error:', error.message);
    return '';
  }

  return data.map((d) => d.text).join('\n');
}



app.post('/api/chat', async (req, res) => {
  const { message, role, history } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const historyContext = (history || [])
      .map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`)
      .join('\n');

    const ragContext = await retrieveContext(message);
    const prompt = `Your name is Cosmo. You are a helpful Center for Industry Solutions assistant.\n
Role: ${role.toUpperCase()}\n
Relevant Info:\n${ragContext}\n
Conversation:\n${historyContext}\n
User: ${message}`;

    const chat = model.startChat({ history: [], generationConfig: { temperature: 0.7 } });
    const result = await chat.sendMessage(prompt);
    const response = result.response;

    res.json({ reply: response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Something went wrong. Please try again.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



