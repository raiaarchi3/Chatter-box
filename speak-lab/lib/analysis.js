
// const FILLERS = new Set(['um', 'uh', 'uhm', 'umm', 'er', 'erm', 'ah', 'hmm', 'mm']);
// const PAUSE_MIN = 0.7; // seconds between words to count as a pause

// /** Speech-to-text via Deepgram: word timestamps + per-word confidence. */
// export async function transcribe(buffer, mimeType, language) {
//   const key = process.env.DEEPGRAM_API_KEY;
//   if (!key) throw new Error('DEEPGRAM_API_KEY is missing in .env.local');

//   const params = new URLSearchParams({
//     model: 'nova-3',
//     language,
//     punctuate: 'true',
//     filler_words: 'true',
//     smart_format: 'false',
//   });
//   const res = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
//     method: 'POST',
//     headers: { Authorization: `Token ${key}`, 'Content-Type': mimeType || 'audio/webm' },
//     body: buffer,
//   });
//   if (!res.ok) throw new Error(`Transcription failed (${res.status}): ${await res.text()}`);
//   const data = await res.json();
//   const words = data?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
//   return words.map((w) => ({
//     word: w.punctuated_word || w.word,
//     clean: (w.word || '').toLowerCase(),
//     start: w.start,
//     end: w.end,
//     confidence: w.confidence,
//   }));
// }

// export function computeMetrics(words, recordedSec) {
//   const wordCount = words.filter((w) => !FILLERS.has(w.clean)).length;
//   const first = words[0]?.start ?? 0;
//   const last = words[words.length - 1]?.end ?? 0;
//   const speakingSec = Math.max(last - first, 1);
//   const wpm = Math.round((wordCount / speakingSec) * 60);

//   const fillerBy = {};
//   words.forEach((w) => {
//     if (FILLERS.has(w.clean)) fillerBy[w.clean] = (fillerBy[w.clean] || 0) + 1;
//   });

//   const pauses = [];
//   for (let i = 0; i < words.length - 1; i++) {
//     const gap = words[i + 1].start - words[i].end;
//     if (gap >= PAUSE_MIN) pauses.push({ after: i, sec: Math.round(gap * 10) / 10 });
//   }

//   const seen = new Set();
//   const lowConf = [];
//   words.forEach((w, i) => {
//     const bare = w.clean.replace(/[^a-z']/g, '');
//     if (w.confidence < 0.8 && bare.length >= 3 && !FILLERS.has(bare) && !seen.has(bare)) {
//       seen.add(bare);
//       lowConf.push({ index: i, word: bare, confidence: Math.round(w.confidence * 100) });
//     }
//   });

//   return {
//     recordedSec: Math.round(recordedSec),
//     leadInSec: Math.round(first * 10) / 10,
//     speakingSec: Math.round(speakingSec),
//     wordCount,
//     wpm,
//     fillers: { total: Object.values(fillerBy).reduce((a, b) => a + b, 0), by: fillerBy },
//     pauses,
//     lowConf: lowConf.slice(0, 12),
//   };
// }

// function markedTranscript(words, pauses) {
//   const pauseAt = new Map(pauses.map((p) => [p.after, p.sec]));
//   return words
//     .map((w, i) => (pauseAt.has(i) ? `${w.word} [pause ${pauseAt.get(i)}s]` : w.word))
//     .join(' ');
// }

// const SYSTEM = `You are a warm but honest speech coach. You get a transcript of a spoken answer with timing data.
// Pause markers like [pause 1.4s] show silences. Filler words (um, uh) are kept in the transcript.
// "Uncertain words" are words the speech recogniser was unsure about; that often (not always) means unclear or non-standard pronunciation.
// Judge SPOKEN English, not written: ignore capitalisation and punctuation the recogniser added, and do not flag normal spoken contractions.
// Only report real issues. Quote "original" text exactly as in the transcript. Be specific, short and kind.
// Respond with ONLY a JSON object, no markdown fences, matching this shape:
// {
//  "score": number 0-100,
//  "summary": "2-3 sentence overall verdict",
//  "grammar": [{"original": "exact phrase", "correction": "fixed phrase", "why": "short reason"}],
//  "pauses": [{"after": "few words right before the spot", "advice": "add" | "shorten", "reason": "short reason"}],
//  "focus": [{"sentence": "the sentence", "issue": "what is weak", "suggestion": "how to say it better"}],
//  "pronunciation": [{"word": "word", "tip": "how to say it, with simple respelling e.g. 'ASS-too-tness'"}],
//  "strengths": ["short point"],
//  "nextSteps": ["short, actionable drill for the next attempt"]
// }
// Limits: grammar max 8, pauses max 6, focus max 4, pronunciation max 8, strengths max 3, nextSteps max 3.
// "pauses": use "add" where a breath/beat would help clarity or emphasis, and "shorten" where a silence hurt the flow.`;

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// async function callGroq(system, user) {
//   const key = process.env.GROQ_API_KEY;
//   if (!key) throw new Error('GROQ_API_KEY is missing in .env.local');
//   // Groq retired llama-3.3-70b-versatile (Aug 2026). Try current models in order.
//   const models = [process.env.GROQ_MODEL, 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b'].filter(Boolean);
//   let lastErr = '';
//   for (const model of models) {
//     for (let attempt = 0; attempt < 2; attempt++) {
//       const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           model,
//           response_format: { type: 'json_object' },
//           temperature: 0.3,
//           max_completion_tokens: 4096,
//           messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
//         }),
//       });
//       if (res.ok) {
//         const data = await res.json();
//         return data.choices?.[0]?.message?.content || '';
//       }
//       lastErr = `Groq error (${res.status}, ${model}): ${await res.text()}`;
//       if (res.status === 404 || res.status === 400) break; // model gone/unsupported: next model
//       if (res.status === 503 || res.status === 429) {
//         await sleep(1500 * (attempt + 1));
//         continue;
//       }
//       throw new Error(lastErr);
//     }
//   }
//   throw new Error(lastErr || 'Groq is unavailable right now.');
// }

// async function callGemini(system, user) {
//   const key = process.env.GEMINI_API_KEY;
//   if (!key) throw new Error('GEMINI_API_KEY is missing in .env.local');
//   const models = [process.env.LLM_MODEL, 'gemini-3.8-flash', 'gemini-flash-latest'].filter(Boolean);
//   let lastErr = '';
//   for (const model of models) {
//     // retry each model a few times on overload (503) / rate limit (429)
//     for (let attempt = 0; attempt < 3; attempt++) {
//       const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             systemInstruction: { parts: [{ text: system }] },
//             contents: [{ role: 'user', parts: [{ text: user }] }],
//             generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
//           }),
//         },
//       );
//       if (res.ok) {
//         const data = await res.json();
//         return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
//       }
//       lastErr = `Gemini error (${res.status}): ${await res.text()}`;
//       if (res.status === 404) break; // model gone, try the next one
//       if (res.status === 503 || res.status === 429) {
//         await sleep(1500 * (attempt + 1));
//         continue;
//       }
//       throw new Error(lastErr); // 400/401/403 etc: real problem, don't retry
//     }
//   }
//   throw new Error(lastErr || 'Gemini is unavailable right now.');
// }

// async function callLLM(system, user) {
//   const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
//   const primary = provider === 'groq' ? callGroq : callGemini;
//   const backup = provider === 'groq' ? (process.env.GEMINI_API_KEY ? callGemini : null) : (process.env.GROQ_API_KEY ? callGroq : null);
//   try {
//     return await primary(system, user);
//   } catch (err) {
//     if (!backup) throw new Error(`${err.message}\n\nTip: add a GROQ_API_KEY as an automatic backup.`);
//     console.warn('Primary LLM failed, using backup:', err.message);
//     return backup(system, user);
//   }
// }

// export async function analyse({ words, metrics, topic, targetSec, language }) {
//   const user = `Topic: ${topic}
// Accent/locale: ${language}
// Target length: ${targetSec}s. Actually spoke: ${metrics.speakingSec}s (recorded ${metrics.recordedSec}s, started speaking after ${metrics.leadInSec}s).
// Pace: ${metrics.wpm} words/min (good range is roughly 120-160).
// Fillers: ${JSON.stringify(metrics.fillers.by)}
// Uncertain words: ${metrics.lowConf.map((w) => `${w.word} (${w.confidence}%)`).join(', ') || 'none'}

// Transcript:
// ${markedTranscript(words, metrics.pauses)}`;

//   const text = await callLLM(SYSTEM, user);
//   const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
//   try {
//     return JSON.parse(json);
//   } catch {
//     throw new Error('The analysis came back malformed. Try again.');
//   }
// }
const FILLERS = new Set(['um', 'uh', 'uhm', 'umm', 'er', 'erm', 'ah', 'hmm', 'mm']);
const PAUSE_MIN = 0.7; // seconds between words to count as a pause

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch that gives up after `ms`, so the route never hangs until the host kills it with a plain-text error. */
async function fetchT(url, options = {}, ms = 25000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(`Request timed out after ${ms / 1000}s (${new URL(url).host})`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Speech-to-text via Deepgram: word timestamps + per-word confidence. */
export async function transcribe(buffer, mimeType, language) {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) throw new Error('DEEPGRAM_API_KEY is missing in .env.local');

  const params = new URLSearchParams({
    model: 'nova-3',
    language: language || 'en-US',
    punctuate: 'true',
    filler_words: 'true',
    smart_format: 'false',
  });
  const res = await fetchT(
    `https://api.deepgram.com/v1/listen?${params}`,
    {
      method: 'POST',
      headers: { Authorization: `Token ${key}`, 'Content-Type': mimeType || 'audio/webm' },
      body: buffer,
    },
    40000,
  );
  if (!res.ok) throw new Error(`Transcription failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const words = data?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
  return words.map((w) => ({
    word: w.punctuated_word || w.word,
    clean: (w.word || '').toLowerCase(),
    start: w.start,
    end: w.end,
    confidence: w.confidence,
  }));
}

export function computeMetrics(words, recordedSec) {
  const wordCount = words.filter((w) => !FILLERS.has(w.clean)).length;
  const first = words[0]?.start ?? 0;
  const last = words[words.length - 1]?.end ?? 0;
  const speakingSec = Math.max(last - first, 1);
  const wpm = Math.round((wordCount / speakingSec) * 60);

  const fillerBy = {};
  words.forEach((w) => {
    if (FILLERS.has(w.clean)) fillerBy[w.clean] = (fillerBy[w.clean] || 0) + 1;
  });

  const pauses = [];
  for (let i = 0; i < words.length - 1; i++) {
    const gap = words[i + 1].start - words[i].end;
    if (gap >= PAUSE_MIN) pauses.push({ after: i, sec: Math.round(gap * 10) / 10 });
  }

  const seen = new Set();
  const lowConf = [];
  words.forEach((w, i) => {
    const bare = w.clean.replace(/[^a-z']/g, '');
    if (w.confidence < 0.8 && bare.length >= 3 && !FILLERS.has(bare) && !seen.has(bare)) {
      seen.add(bare);
      lowConf.push({ index: i, word: bare, confidence: Math.round(w.confidence * 100) });
    }
  });

  return {
    recordedSec: Math.round(recordedSec || 0),
    leadInSec: Math.round(first * 10) / 10,
    speakingSec: Math.round(speakingSec),
    wordCount,
    wpm,
    fillers: { total: Object.values(fillerBy).reduce((a, b) => a + b, 0), by: fillerBy },
    pauses,
    lowConf: lowConf.slice(0, 12),
  };
}

function markedTranscript(words, pauses) {
  const pauseAt = new Map(pauses.map((p) => [p.after, p.sec]));
  return words
    .map((w, i) => (pauseAt.has(i) ? `${w.word} [pause ${pauseAt.get(i)}s]` : w.word))
    .join(' ');
}

const SYSTEM = `You are a warm but honest speech coach. You get a transcript of a spoken answer with timing data.
Pause markers like [pause 1.4s] show silences. Filler words (um, uh) are kept in the transcript.
"Uncertain words" are words the speech recogniser was unsure about; that often (not always) means unclear or non-standard pronunciation.
Judge SPOKEN English, not written: ignore capitalisation and punctuation the recogniser added, and do not flag normal spoken contractions.
Only report real issues. Quote "original" text exactly as in the transcript. Be specific, short and kind.
Respond with ONLY a JSON object, no markdown fences, matching this shape:
{
 "score": number 0-100,
 "summary": "2-3 sentence overall verdict",
 "grammar": [{"original": "exact phrase", "correction": "fixed phrase", "why": "short reason"}],
 "pauses": [{"after": "few words right before the spot", "advice": "add" | "shorten", "reason": "short reason"}],
 "focus": [{"sentence": "the sentence", "issue": "what is weak", "suggestion": "how to say it better"}],
 "pronunciation": [{"word": "word", "tip": "how to say it, with simple respelling e.g. 'ASS-too-tness'"}],
 "strengths": ["short point"],
 "nextSteps": ["short, actionable drill for the next attempt"]
}
Limits: grammar max 8, pauses max 6, focus max 4, pronunciation max 8, strengths max 3, nextSteps max 3.
"pauses": use "add" where a breath/beat would help clarity or emphasis, and "shorten" where a silence hurt the flow.`;

async function callGroq(system, user) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is missing in .env.local');
  // Override with GROQ_MODEL in .env.local if one of these is retired.
  const models = [process.env.GROQ_MODEL, 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b'].filter(Boolean);
  let lastErr = '';
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetchT('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_completion_tokens: 4096,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      }
      lastErr = `Groq error (${res.status}, ${model}): ${(await res.text()).slice(0, 300)}`;
      if (res.status === 404 || res.status === 400) break; // model gone/unsupported: next model
      if (res.status === 503 || res.status === 429) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw new Error(lastErr);
    }
  }
  throw new Error(lastErr || 'Groq is unavailable right now.');
}

async function callGemini(system, user) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is missing in .env.local');
  // Override with LLM_MODEL in .env.local if one of these is retired.
  const models = [process.env.LLM_MODEL, 'gemini-3.8-flash', 'gemini-flash-latest'].filter(Boolean);
  let lastErr = '';
  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetchT(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
      }
      lastErr = `Gemini error (${res.status}, ${model}): ${(await res.text()).slice(0, 300)}`;
      if (res.status === 404) break;
      if (res.status === 503 || res.status === 429) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw new Error(lastErr);
    }
  }
  throw new Error(lastErr || 'Gemini is unavailable right now.');
}

async function callLLM(system, user) {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const primary = provider === 'groq' ? callGroq : callGemini;
  const backup =
    provider === 'groq'
      ? process.env.GEMINI_API_KEY ? callGemini : null
      : process.env.GROQ_API_KEY ? callGroq : null;
  try {
    return await primary(system, user);
  } catch (err) {
    if (!backup) throw new Error(`${err.message}\n\nTip: add a second API key (GROQ_API_KEY or GEMINI_API_KEY) as an automatic backup.`);
    console.warn('Primary LLM failed, using backup:', err.message);
    return backup(system, user);
  }
}

/** Pull a JSON object out of model text (handles <think> blocks and ``` fences). */
function parseModelJson(text) {
  const cleaned = String(text).replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```(?:json)?/gi, '');
  const json = cleaned.slice(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1);
  try {
    return JSON.parse(json);
  } catch {
    throw new Error('The analysis came back malformed. Please try again.');
  }
}

/** Make sure the UI always gets the shape it expects. */
function normalise(r) {
  const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(r.score) || 0))),
    summary: typeof r.summary === 'string' ? r.summary : '',
    grammar: arr(r.grammar, 8),
    pauses: arr(r.pauses, 6),
    focus: arr(r.focus, 4),
    pronunciation: arr(r.pronunciation, 8),
    strengths: arr(r.strengths, 3),
    nextSteps: arr(r.nextSteps, 3),
  };
}

export async function analyse({ words, metrics, topic, targetSec, language }) {
  if (!words?.length) throw new Error("We couldn't hear any speech. Check your mic and try again.");

  const user = `Topic: ${topic}
Accent/locale: ${language}
Target length: ${targetSec}s. Actually spoke: ${metrics.speakingSec}s (recorded ${metrics.recordedSec}s, started speaking after ${metrics.leadInSec}s).
Pace: ${metrics.wpm} words/min (good range is roughly 120-160).
Fillers: ${JSON.stringify(metrics.fillers.by)}
Uncertain words: ${metrics.lowConf.map((w) => `${w.word} (${w.confidence}%)`).join(', ') || 'none'}

Transcript:
${markedTranscript(words, metrics.pauses)}`;

  const text = await callLLM(SYSTEM, user);
  return normalise(parseModelJson(text));
}