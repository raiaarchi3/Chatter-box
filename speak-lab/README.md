# Speak Lab

Pick a topic (slot machine), choose how long to speak, record, get AI feedback on grammar, pauses, focus sentences and pronunciation.

## Run
```bash
npm install
cp .env.example .env.local   # add your two keys
npm run dev                  # http://localhost:3000
```
- `DEEPGRAM_API_KEY` — transcription with word timestamps + per-word confidence (pauses, pace, unclear words)
- `GEMINI_API_KEY` (free, https://aistudio.google.com/apikey) or `GROQ_API_KEY` with `LLM_PROVIDER=groq` — grammar, pause advice, focus sentences, pronunciation tips

## How it works
1. Browser records audio (MediaRecorder) with a live mic meter and countdown.
2. `/api/analyze` sends it to Deepgram → words + timings + confidence.
3. `lib/analysis.js` computes WPM, fillers, long pauses (≥0.7s), low-confidence words.
4. The LLM gets the transcript with `[pause 1.4s]` markers and returns JSON feedback.
5. `Report.jsx` renders the marked-up transcript and feedback cards.

Pronunciation is inferred from recognition confidence, so it's a guide, not a phonetic scorer.
Mic access needs `localhost` or HTTPS. Add topics in `lib/topics.js`.
