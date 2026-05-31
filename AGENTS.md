# Jokes Bapak-Bapak Generator

Webapp generate jokes bapak-bapak berdasarkan keyword menggunakan LLM via OpenAI API.

## Stack
- **Frontend:** HTML + JS (static, di `public/`)
- **Backend:** Node.js + Express (`server.js`)
- **LLM API:** OpenAI API (default `gpt-4o-mini`)

## Struktur
```
/opt/bapak/
├── public/index.html   # Frontend
├── server.js           # Express server
├── .env                # OPENAI_API_KEY + model config
├── package.json
└── eg-jokes.txt        # Referensi gaya jokes (few-shot)
```

## Cara jalanin
```bash
cd /mnt/d/project/Bapak
npm install
npm start    # → http://localhost:3000
```

## Deploy production
```bash
npm install -g pm2
pm2 start server.js --name bapak
pm2 save && pm2 startup
```

## Environment (.env)
| Variable | Default | Keterangan |
|---|---|---|
| `OPENAI_API_KEY` | - | Wajib. Daftar di https://platform.openai.com/api-keys |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model OpenAI (contoh: `gpt-4o`, `gpt-4o-mini`) |
| `PORT` | `3000` | Port server |

## API Endpoints
- `POST /api/generate` — body `{ keyword: string }` → `{ question, answer, model }`
- `GET /api/status` — → `{ apiKeyConfigured, defaultModel }`

## Alur generate
1. User input keyword
2. Backend panggil OpenAI API dengan few-shot examples dari `eg-jokes.txt`
3. LLM generate jokes, keyword **wajib** muncul di soal/jawaban
4. Kalo gagal/error, fallback ke random jokes dari koleksi lokal

## Yang bisa dikembangin
- [ ] Leaderboard / vote jokes terbaik
- [ ] History jokes yang pernah di-generate
- [ ] Share ke WhatsApp / Twitter
- [ ] Multi-bahasa (English version)
- [ ] Ganti background / tema
- [ ] Rate limiting / proteksi spam endpoint
