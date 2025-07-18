const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

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
   const prompt = `
You are COSMO, a helpful assistant for the Center for Industry Solutions.

Respond in a friendly, laid-back tone with a touch of humor when appropriate.
You're knowledgeable but casual—think of yourself as the cool lab assistant everyone likes to chat with.
Only mention your name or your role if the user asks.
Keep responses concise, helpful, and engaging.

ROLE: ${role.toUpperCase()}

Relevant Info:
${ragContext}

Conversation:
${historyContext}

User: ${message}
`;


    const chat = model.startChat({ history: [], generationConfig: { temperature: 0.7 } });
    const result = await chat.sendMessage(prompt);
    const response = result.response;

    res.json({ reply: response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Something went wrong. Please try again.' });
  }
});




//Github COMMIT API

// GitHub COMMIT API
async function fetchWithRetry(url, token, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      // Check if response is JSON
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`Non-JSON response from ${url}: Content-Type ${contentType}`);
        throw new Error('Received non-JSON response from GitHub API');
      }

      if (response.status === 202) {
        console.log(`GitHub API processing, retrying ${url}... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (response.status === 200) {
        return response;
      }

      throw new Error(`Unexpected status code: ${response.status}`);
    } catch (err) {
      console.error(`Fetch attempt ${i + 1} failed for ${url}: ${err.message}`);
      if (i === retries - 1) {
        console.error(`Max retries reached for ${url}`);
        return { data: [] }; // Fallback empty data
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return { data: [] }; // Fallback empty data
}

app.get('/api/github/commits', async (req, res) => {
  console.log('📡 HIT: /api/github/commits');
  try {
    const username = 'BenjaminK0';
    const githubToken = process.env.GITHUB_TOKEN; // Ensure this is set in .env

    if (!githubToken) {
      console.error('GitHub token is missing');
      return res.status(500).json({ error: 'GitHub API token is not configured' });
    }

    // Fetch repository list
    const repoList = await axios.get(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!repoList.data || !Array.isArray(repoList.data)) {
      console.error('Invalid repo list response:', repoList.data);
      return res.status(500).json({ error: 'Invalid repository list from GitHub' });
    }

    // Fetch commit activity for each repo
    const commitRequests = repoList.data.map(repo =>
      fetchWithRetry(
        `https://api.github.com/repos/${username}/${repo.name}/stats/commit_activity`,
        githubToken
      )
    );

    const commitResults = await Promise.all(commitRequests);

    // Aggregate weekly commit totals
    const weeklyTotals = Array(52).fill(0);
    commitResults.forEach(result => {
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((week, i) => {
          weeklyTotals[i] += week.total || 0;
        });
      }
    });

    res.json({ weeks: weeklyTotals });
  } catch (err) {
    console.error('GitHub commit aggregation failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch commit activity', details: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));