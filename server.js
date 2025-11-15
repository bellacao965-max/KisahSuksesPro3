// server.js - Sumber Inspirasi (Render-ready) - uses OPENAI_API_KEY directly
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Chat endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const prompt = (req.body && req.body.prompt) || '';
    const max_tokens = (req.body && req.body.max_tokens) || 400;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    if (!OPENAI_API_KEY) {
      const text = 'Offline fallback: connect OPENAI_API_KEY in Render environment to enable full AI.';
      return res.json({ text });
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Sumber Inspirasi — a bilingual motivational mentor. Keep replies concise, friendly, and helpful.' },
          { role: 'user', content: prompt }
        ],
        max_tokens
      })
    });
    const j = await r.json();
    const text = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text || JSON.stringify(j);
    res.json({ text });
  } catch (err) {
    console.error('AI proxy error', err);
    res.status(500).json({ error: 'AI proxy failed', detail: String(err) });
  }
});

// Image generation endpoint (OpenAI images)
app.post('/api/image', async (req, res) => {
  try {
    const prompt = (req.body && req.body.prompt) || '';
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: '1024x1024'
      })
    });
    const j = await r.json();
    const url = j?.data?.[0]?.url || null;
    const b64 = j?.data?.[0]?.b64_json || null;
    if (url) return res.json({ url });
    if (b64) return res.json({ b64 });
    return res.status(500).json({ error: 'No image returned', detail: j });
  } catch (err) {
    console.error('Image proxy error', err);
    res.status(500).json({ error: 'Image proxy failed', detail: String(err) });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log('🚀 Sumber Inspirasi running on port', PORT));
