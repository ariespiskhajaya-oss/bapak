require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY belum diatur. Isi di .env');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const EXAMPLES = [
  { q: "Ayam apa yang bikin kesel?", a: "Ayam habis, nasi masih banyak" },
  { q: "Kopi apa yang bisa nyapit?", a: "Kopi-ting" },
  { q: "Kenapa hujan bikin orang galau?", a: "Soalnya jatuhnya barengan" },
  { q: "Kenapa donat bolong?", a: "Cinta ayah utuh" },
  { q: "Mangga apa yang serem?", a: "Manggaruk pantat singa" },
  { q: "Kenapa kursi nggak pernah lari?", a: "Takut dibilang bangku cadangan" },
  { q: "Lele apa yang bisa terbang?", a: "Kelelawar" },
  { q: "Kucing apa yang kuno?", a: "Kucinggalan zaman" },
];

function buildPrompt(keyword) {
  const fewShot = EXAMPLES.map(e => `PERTANYAAN: ${e.q}\nJAWABAN: ${e.a}`).join('\n\n');
  return `Kamu adalah seorang bapak-bapak Indonesia yang suka bikin jokes receh.
Buatlah SATU jokes bapak-bapak berdasarkan kata kunci: "${keyword}".

Berikut contoh gaya jokes bapak-bapak Indonesia:

${fewShot}

Format jawaban harus persis seperti ini (tanpa markdown, tanpa label tambahan):
PERTANYAAN: <pertanyaan lucu>
JAWABAN: <jawaban receh>

Pastikan joke-nya:
- Singkat dan padat (1 pertanyaan + 1 jawaban)
- Gaya bapak-bapak Indonesia (wordplay, plesetan, logika absurd)
- Lucu dan receh khas bapak-bapak
- Kata "${keyword}" HARUS muncul di pertanyaan atau jawaban
- Jangan pakai tanda kutip, tanda kurung siku, atau markdown`;
}

function parseJoke(text) {
  if (!text || !text.trim()) return { question: 'Jokes buat kamu', answer: 'Nggak tau ah' };
  let question = '', answer = '';
  const qMatch = text.match(/PERTANYAAN:\s*(.+)/i);
  const aMatch = text.match(/JAWABAN:\s*(.+)/i);
  if (qMatch && aMatch) {
    question = qMatch[1].trim();
    answer = aMatch[1].trim();
  } else {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length >= 2) {
      question = lines[0].replace(/^[QA].*?[:.]?\s*/i, '').trim();
      answer = lines[lines.length - 1].replace(/^[QA].*?[:.]?\s*/i, '').trim();
    } else {
      question = 'Jokes buat kamu';
      answer = text;
    }
  }
  return { question, answer };
}

app.post('/api/generate', async (req, res) => {
  const { keyword, model } = req.body;
  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: 'Keyword wajib diisi' });
  }

  if (!API_KEY) {
    return res.status(400).json({ error: 'OPENAI_API_KEY belum dikonfigurasi di server' });
  }

  try {
    const modelId = model || MODEL;
    const url = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'user', content: buildPrompt(keyword.trim()) + '\n\nBuat jokes bapak-bapak tentang ' + keyword.trim() }
        ],
        temperature: 0.9,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('OpenAI API error (' + response.status + '): ' + errText);
    }

    const data = await response.json();
    const msg = data.choices?.[0]?.message;
    const content = msg?.content;
    if (!content) {
      const reason = msg?.refusal ? ' (refusal: ' + msg.refusal + ')' : ' (reasoning model habis token?)';
      throw new Error('LLM returned empty response' + reason);
    }
    const text = content.trim();
    const joke = parseJoke(text);

    res.json({ question: joke.question, answer: joke.answer, model: data.model || model || MODEL });
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    apiKeyConfigured: !!API_KEY,
    defaultModel: MODEL,
    provider: 'openai',
  });
});

app.listen(PORT, () => {
  console.log('🚀 Jokes Bapak-Bapak running at http://localhost:' + PORT);
});
