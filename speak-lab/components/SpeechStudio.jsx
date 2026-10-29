// 'use client';
// import { useEffect, useMemo, useRef, useState } from 'react';
// import Dropdown from './Dropdown';
// import SlotMachine, { useSlot } from './SlotMachine';
// import Report from './Report';
// import { useRecorder } from './useRecorder';
// import {
//   CATEGORIES, FRAMEWORKS, INTERVIEW, INTERVIEW_SETS, LANGS, LEVELS, TOPICS, VOCAB, pool,
// } from '../lib/topics';

// const TABS = [
//   { id: 'random', label: 'Random Topics', title: ['Speak', 'Up'], defaultSec: 60,
//     steps: ['Get random topic', 'Pick your time', 'Record & speak!'] },
//   { id: 'interview', label: 'Interview Prep', title: ['Interview', 'Prep'], defaultSec: 120,
//     steps: ['Get a question', 'Pick your time', 'Answer out loud'] },
//   { id: 'vocab', label: 'Learn Vocab', title: ['Learn', 'Vocab'], defaultSec: 30,
//     steps: ['Get random word', 'Pick your time', 'Use it in speech'] },
// ];
// function Doodles() {
//   return (
//     <div className="doodles" aria-hidden="true">
//       <svg className="d d-star" viewBox="0 0 40 40"><path d="M20 3l4.6 10.4L36 14.6l-8.6 7.6 2.6 11.2L20 27.6 10 33.4l2.6-11.2L4 14.6l11.4-1.2z" /></svg>
//       <svg className="d d-squig" viewBox="0 0 120 20"><path d="M2 12q8-12 16 0t16 0 16 0 16 0 16 0 16 0 16 0" /></svg>
//       <svg className="d d-spark" viewBox="0 0 40 40"><path d="M20 4v10M20 26v10M4 20h10M26 20h10M9 9l7 7M24 24l7 7M31 9l-7 7M16 24l-7 7" /></svg>
//       <svg className="d d-dots" viewBox="0 0 80 20"><circle cx="6" cy="10" r="3" /><circle cx="26" cy="10" r="3" /><circle cx="46" cy="10" r="3" /><circle cx="66" cy="10" r="3" /></svg>
//       <svg className="d d-flower" viewBox="0 0 50 50"><circle cx="25" cy="10" r="8" /><circle cx="40" cy="25" r="8" /><circle cx="25" cy="40" r="8" /><circle cx="10" cy="25" r="8" /><circle cx="25" cy="25" r="5" className="core" /></svg>
//       <svg className="d d-swirl" viewBox="0 0 50 50"><path d="M25 25c0-4 5-4 5 0s-8 6-10 0 4-14 14-10 8 18-4 22-24-2-22-18" /></svg>
//       <svg className="d d-arc" viewBox="0 0 70 30"><path d="M3 25C15 3 50 3 66 22M66 22l-9-1M66 22l-3-9" /></svg>
//       <svg className="d d-bolt" viewBox="0 0 30 40"><path d="M18 2L5 22h9l-3 16 14-22h-9z" /></svg>
//     </div>
//   );
// }

// const DURATIONS = [30, 60, 120, 180, 300];
// const label = (s) => (s < 60 ? `${s}s` : `${s / 60} min`);
// const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.ceil(s % 60))).padStart(2, '0')}`;

// export default function SpeechStudio() {
//   const [tab, setTab] = useState('random');
//   const [lang, setLang] = useState('en-US');
//   const [level, setLevel] = useState('random');
//   const [cat, setCat] = useState('hot');
//   const [iset, setIset] = useState('behavioral');
//   const [duration, setDuration] = useState(60);
//   const [phase, setPhase] = useState('idle'); // idle | recording | analyzing | done
//   const [remaining, setRemaining] = useState(0);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState('');
//   const [topicUsed, setTopicUsed] = useState('');

//   const meta = TABS.find((t) => t.id === tab);
//   const { start, stop, level: mic } = useRecorder();
//   const startedAt = useRef(0);
//   const finishing = useRef(false);

//   const items = useMemo(() => {
//     if (tab === 'random') return pool(TOPICS[cat], level);
//     if (tab === 'interview') return pool(INTERVIEW[iset], level);
//     return pool(VOCAB, level);
//   }, [tab, cat, iset, level]);

//   const slot = useSlot(items);
//   const topic = items[slot.index];

//   const changeTab = (id) => {
//     setTab(id);
//     setDuration(TABS.find((t) => t.id === id).defaultSec);
//     setError('');
//   };

//   async function begin() {
//     setError('');
//     try {
//       await start();
//     } catch {
//       setError('Microphone access was blocked. Allow it in your browser and try again.');
//       return;
//     }
//     setTopicUsed(topic);
//     finishing.current = false;
//     startedAt.current = Date.now();
//     setRemaining(duration);
//     setPhase('recording');
//   }

//   async function finish() {
//     if (finishing.current) return;
//     finishing.current = true;
//     const recordedSec = (Date.now() - startedAt.current) / 1000;
//     const blob = await stop();
//     if (!blob || blob.size < 2000 || recordedSec < 3) {
//       setError('That was too short to analyse. Try speaking for a bit longer.');
//       return setPhase('idle');
//     }
//     setPhase('analyzing');
//     try {
//       const fd = new FormData();
//       fd.append('audio', blob, 'speech.webm');
//       fd.append('topic', topic);
//       fd.append('language', lang);
//       fd.append('targetSec', String(duration));
//       fd.append('recordedSec', String(recordedSec));
//       const res = await fetch('/api/analyze', { method: 'POST', body: fd });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Analysis failed.');
//       setResult(data);
//       setPhase('done');
//     } catch (e) {
//       setError(e.message);
//       setPhase('idle');
//     }
//   }

//   useEffect(() => {
//     if (phase !== 'recording') return;
//     const id = setInterval(() => {
//       const left = duration - (Date.now() - startedAt.current) / 1000;
//       setRemaining(left);
//       if (left <= 0) finish();
//     }, 200);
//     return () => clearInterval(id);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [phase, duration]);

//   const customMin = DURATIONS.includes(duration) ? '' : String(duration / 60);

//   return (
//     <main className="page">
//       <nav className="tabs">
//         {TABS.map((t) => (
//           <button key={t.id} className={t.id === tab ? 'on' : ''} onClick={() => changeTab(t.id)} disabled={phase !== 'idle' && phase !== 'done'}>
//             {t.label}
//           </button>
//         ))}
//       </nav>
//       <div className="brand hand">tiny steps to a louder voice</div>

//       {phase === 'done' && result && (
//         <Report result={result} topic={topicUsed} targetSec={duration} onRetry={() => { setPhase('idle'); setResult(null); }} />
//       )}

//       {phase === 'recording' && (
//         <section className="stage">
//           <p className="eyebrow">Speak now</p>
//           <h2 className="serif topic-big">{topicUsed}</h2>
//           <div className="timer" style={{ '--lvl': mic }}>
//             <span className="pulse" />
//             <b>{mmss(remaining)}</b>
//           </div>
//           <div className="bar"><i style={{ width: `${Math.min(100, ((duration - remaining) / duration) * 100)}%` }} /></div>
//           <button className="btn solid" onClick={finish}>■ Stop &amp; get analysis</button>
//         </section>
//       )}

//       {phase === 'analyzing' && (
//         <section className="stage">
//           <div className="spinner" />
//           <h2 className="serif">Listening back to your speech…</h2>
//           <p className="muted">Transcribing, timing your pauses and checking grammar. About 10–20 seconds.</p>
//         </section>
//       )}

//       {phase === 'idle' && (
//         <section className="hero">
//           <div className="left">
//             <div className="title-wrap">
//               <Doodles />
//               <h1 className="hand title">
//                 <span>{meta.title[0]}</span>
//                 <span>{meta.title[1]}</span>
//               </h1>
//             </div>
//             <ol className="hand steps">
//               {meta.steps.map((s) => <li key={s}>{s}</li>)}
//             </ol>
//             {tab === 'interview' && (
//               <div className="frameworks">
//                 <p className="eyebrow">Frameworks</p>
//                 {FRAMEWORKS.map((f) => (
//                   <details key={f.name}>
//                     <summary className="hand">{f.name}</summary>
//                     <p>{f.body}</p>
//                   </details>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="right">
//             <div className="filters">
//               {tab !== 'interview' && <Dropdown value={lang} options={LANGS} onChange={setLang} />}
//               {tab === 'interview' && <Dropdown value={iset} options={INTERVIEW_SETS} onChange={setIset} />}
//               <Dropdown value={level} options={LEVELS} onChange={setLevel} />
//               {tab === 'random' && <Dropdown value={cat} options={CATEGORIES} onChange={setCat} />}
//             </div>

//             <SlotMachine items={items} index={slot.index} spinning={slot.spinning} onSpin={slot.spin} />

//             <div className="durations">
//               <span className="eyebrow">Speak for</span>
//               {DURATIONS.map((d) => (
//                 <button key={d} className={`pill sm ${duration === d ? 'on' : ''}`} onClick={() => setDuration(d)}>{label(d)}</button>
//               ))}
//               <label className={`pill sm custom ${customMin ? 'on' : ''}`}>
//                 <input
//                   type="number" min="0.5" max="15" step="0.5" placeholder="custom"
//                   value={customMin}
//                   onChange={(e) => {
//                     const m = parseFloat(e.target.value);
//                     if (m > 0) setDuration(Math.min(15, m) * 60);
//                   }}
//                 />
//                 min
//               </label>
//             </div>

//             <div className="actions">
//               <button className="btn solid" onClick={slot.spin} disabled={slot.spinning}>Spin!</button>
//               <button className="btn ghost" onClick={begin} disabled={slot.spinning}>Start Timer →</button>
//             </div>
//             {error && <p className="error">{error}</p>}
//           </div>
//         </section>
//       )}
//     </main>
//   );
// }
'use client';
import { useEffect, useRef, useState } from 'react';

const TOPICS = {
  Fun: ['Describe your perfect lazy Sunday.', 'Convince us pineapple belongs on pizza.', 'If you were a snack, which one and why?', 'Sell a pen to a cat.'],
  Work: ['Defend that all meetings should be standing meetings.', 'Explain your job to a five year old.', 'Is working from home better than the office?', 'Roast the idea that hard work always pays off.'],
  Debate: ['Social media does more good than harm.', 'Homework should be banned.', 'Money can buy happiness.', 'Everyone should learn to cook.'],
  Life: ['Tell us about a small win from this week.', 'What would you tell your 10 year old self?', 'Describe your hometown to a stranger.', 'A habit you want to build, and why.'],
};
const LANGS = [{ v: 'en-US', l: 'US EN' }, { v: 'en-GB', l: 'UK EN' }, { v: 'en-IN', l: 'IN EN' }, { v: 'en-AU', l: 'AU EN' }];
const CATS = [{ v: 'all', l: 'Random' }, ...Object.keys(TOPICS).map((k) => ({ v: k, l: k }))];
const FRAMEWORKS = [
  ['PREP', 'Point, Reason, Example, Point again. Great for opinions.'],
  ['Past · Present · Future', 'Walk through time. Great for stories.'],
  ['Problem · Solution', 'Name the pain, then fix it. Great for pitches.'],
];
const FILLERS = ['um', 'uh', 'uhm', 'umm', 'er', 'erm', 'ah', 'hmm', 'mm'];
const day = (off) => new Date(Date.now() - off * 864e5).toISOString().slice(0, 10);

function Dropdown({ icon, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = options.find((o) => o.v === value) || options[0];
  return (
    <div className="dd">
      <button className="pill" onClick={() => setOpen(!open)}>{icon}{cur.l}<small>▾</small></button>
      {open && (
        <ul className="dd-menu">
          {options.map((o) => (
            <li key={o.v}><button onClick={() => { onChange(o.v); setOpen(false); }}>{o.l}{o.v === value && <b>✓</b>}</button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Doodles() {
  return (
    <div className="doodles" aria-hidden="true">
      <svg className="d d-star" viewBox="0 0 24 24"><path d="M12 2l2.9 6.9L22 10l-5.5 4.7L18 22l-6-3.7L6 22l1.5-7.3L2 10l7.1-1.1z" /></svg>
      <svg className="d d-squig" viewBox="0 0 100 20"><path d="M2 12 Q12 2 22 12 T42 12 T62 12 T82 12 T98 10" /></svg>
      <svg className="d d-spark" viewBox="0 0 24 24"><path d="M12 2v6M12 16v6M2 12h6M16 12h6" /></svg>
      <svg className="d d-dots" viewBox="0 0 60 12"><circle cx="6" cy="6" r="4" /><circle cx="22" cy="6" r="4" /><circle cx="38" cy="6" r="4" /><circle cx="54" cy="6" r="4" /></svg>
      <svg className="d d-flower" viewBox="0 0 40 40">
        {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx="20" cy="9" r="7" transform={`rotate(${a} 20 20)`} />)}
        <circle className="core" cx="20" cy="20" r="5" />
      </svg>
      <svg className="d d-swirl" viewBox="0 0 26 26"><path d="M4 22 C2 6 22 4 22 14 C22 22 10 22 12 14" /></svg>
      <svg className="d d-arc" viewBox="0 0 40 24"><path d="M2 22 Q20 0 38 22" /></svg>
      <svg className="d d-bolt" viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>
    </div>
  );
}

export default function SpeechStudio() {
  const [cat, setCat] = useState('all');
  const [lang, setLang] = useState('en-US');
  const [mins, setMins] = useState(2);
  const [custom, setCustom] = useState('');
  const [topic, setTopic] = useState('');
  const [around, setAround] = useState([TOPICS.Work[3], TOPICS.Work[0]]);
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | speaking | analysing
  const [left, setLeft] = useState(120);
  const [level, setLevel] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [streak, setStreak] = useState(0);

  const rec = useRef(null), chunks = useRef([]), timer = useRef(null), t0 = useRef(0), stream = useRef(null), ctx = useRef(null), cfg = useRef({});

  const customMin = parseFloat(custom);
  const secs = customMin > 0 ? Math.min(600, Math.round(customMin * 60)) : mins * 60;

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('sp-streak') || '{}');
      setStreak(s.last === day(0) || s.last === day(1) ? s.n || 0 : 0);
    } catch {}
    return cleanup;
  }, []);

  function cleanup() {
    clearInterval(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    ctx.current?.close().catch(() => {});
    ctx.current = null;
  }

  function bumpStreak() {
    try {
      const s = JSON.parse(localStorage.getItem('sp-streak') || '{}');
      if (s.last === day(0)) return;
      const n = s.last === day(1) ? (s.n || 0) + 1 : 1;
      localStorage.setItem('sp-streak', JSON.stringify({ n, last: day(0) }));
      setStreak(n);
    } catch {}
  }

  function spin() {
    if (spinning) return;
    const pool = cat === 'all' ? Object.values(TOPICS).flat() : TOPICS[cat];
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    setSpinning(true); setResult(null); setError('');
    let i = 0;
    const iv = setInterval(() => {
      setTopic(pick()); setAround([pick(), pick()]);
      if (++i > 14) { clearInterval(iv); setSpinning(false); }
    }, 90);
  }

  async function start() {
    setError(''); setResult(null);
    if (!topic) return setError('Pull the lever to get a topic first.');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      return setError('This browser cannot record audio. Try the latest Chrome, Edge or Safari.');
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return setError('Microphone blocked. Allow mic access in your browser and try again.');
    }
    // mic level -> pulsing circle
    let analyser, data;
    try {
      ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser = ctx.current.createAnalyser(); analyser.fftSize = 256;
      ctx.current.createMediaStreamSource(stream.current).connect(analyser);
      data = new Uint8Array(analyser.fftSize);
    } catch {}

    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((m) => MediaRecorder.isTypeSupported(m));
    rec.current = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined);
    chunks.current = [];
    rec.current.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.current.onstop = send;
    cfg.current = { topic, secs, lang };
    t0.current = Date.now(); setLeft(secs); setPhase('speaking');
    rec.current.start(1000);
    timer.current = setInterval(() => {
      const l = Math.max(0, secs - (Date.now() - t0.current) / 1000);
      setLeft(l);
      if (analyser) {
        analyser.getByteTimeDomainData(data);
        let sum = 0; for (const v of data) sum += ((v - 128) / 128) ** 2;
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
      }
      if (l <= 0) stop();
    }, 100);
  }

  function stop() {
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop();
    cleanup();
  }

  async function send() {
    setPhase('analysing'); setLevel(0);
    const c = cfg.current;
    const blob = new Blob(chunks.current, { type: rec.current.mimeType || 'audio/webm' });
    const fd = new FormData();
    fd.append('audio', blob, 'speech.webm');
    fd.append('topic', c.topic);
    fd.append('targetSec', c.secs);
    fd.append('recordedSec', (Date.now() - t0.current) / 1000);
    fd.append('language', c.lang);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch { throw new Error('Server said: ' + raw.slice(0, 200)); }
      if (data.error) throw new Error(data.error);
      setResult(data); bumpStreak();
    } catch (e) { setError(e.message); }
    setPhase('idle');
  }

  const mm = Math.floor(left / 60) + ':' + String(Math.floor(left % 60)).padStart(2, '0');
  const pct = cfg.current.secs ? 100 - (left / cfg.current.secs) * 100 : 0;

  return (
    <div className="page">
      <div className="pill sm" style={{ position: 'absolute', left: 24, top: 22 }}>🔥 {streak} day streak</div>
      <div className="brand hand">Baby steps to the Mic</div>

      <nav className="tabs">
        <button className="on">Random Topic</button>
        {['Interview Prep', 'Learn Vocab', 'Deep Research'].map((t) => (
          <button key={t} onClick={() => alert('Coming soon 🌱')}>{t}</button>
        ))}
      </nav>

      {phase === 'idle' && (
        <section className="hero">
          <div>
            <div className="title-wrap">
              <Doodles />
              <h1 className="title hand"><span>Speech</span><span>Pact</span></h1>
            </div>
            <ol className="steps hand">
              <li>Get random topic</li>
              <li>Set {secs >= 60 ? Math.round(secs / 6) / 10 + ' min' : secs + ' sec'} timer</li>
              <li>Record &amp; speak 😊</li>
            </ol>
            <div className="frameworks">
              {FRAMEWORKS.map(([n, d]) => (
                <details key={n}><summary className="hand">{n}</summary><p>{d}</p></details>
              ))}
            </div>
          </div>

          <div className="right">
            <div className="filters">
              <Dropdown icon="🌐 " value={lang} options={LANGS} onChange={setLang} />
              <Dropdown icon="🎲 " value={cat} options={CATS} onChange={setCat} />
            </div>

            <div className="slot-wrap">
              <div className={'slot' + (spinning ? ' is-spinning' : '')}>
                <div className="slot-row ghost">{around[0]}</div>
                <div className="slot-row main" key={topic}>{topic || 'Pull the lever to meet your topic ✨'}</div>
                <div className="slot-row ghost">{around[1]}</div>
              </div>
              <button className={'lever' + (spinning ? ' pulled' : '')} onClick={spin} aria-label="Pull the lever">
                <span className="lever-note">pull lever ↓</span>
                <i className="stick" /><i className="knob" />
              </button>
            </div>

            <div className="durations">
              <span className="eyebrow">Time</span>
              {[1, 2, 3, 5].map((m) => (
                <button key={m} className={'pill sm' + (!custom && mins === m ? ' on' : '')} onClick={() => { setMins(m); setCustom(''); }}>{m} min</button>
              ))}
              <label className={'pill sm custom' + (custom ? ' on' : '')}>
                <input type="number" min="0.5" max="10" step="0.5" placeholder="Custom min" value={custom} onChange={(e) => setCustom(e.target.value)} />
              </label>
            </div>

            {error && <p className="error">{error}</p>}
            <div className="actions">
              <button className="btn solid" onClick={spin} disabled={spinning}>Spin!</button>
              <button className="btn ghost" onClick={start} disabled={!topic || spinning}>Start Timer →</button>
            </div>
          </div>
        </section>
      )}

      {phase === 'speaking' && (
        <section className="stage">
          <p className="eyebrow">Your topic</p>
          <h2 className="topic-big serif">{cfg.current.topic}</h2>
          <div className="timer" style={{ '--lvl': level }}><div className="pulse" /><b>{mm}</b></div>
          <div className="bar"><i style={{ width: pct + '%' }} /></div>
          <p className="muted">Recording… speak naturally, we're listening 🎤</p>
          <button className="btn solid" onClick={stop}>I'm done</button>
        </section>
      )}

      {phase === 'analysing' && (
        <section className="stage">
          <div className="spinner" />
          <h2 className="topic-big serif">Reading your speech…</h2>
          <p className="muted">Checking grammar, pauses and pronunciation 🔍</p>
        </section>
      )}

      {phase !== 'speaking' && phase !== 'analysing' && result && <Report r={result} topic={cfg.current.topic} />}
    </div>
  );
}

function List({ items, render }) {
  return items.length ? items.map((x, i) => <div className="item" key={i}>{render(x)}</div>) : <p className="muted">Nothing here, nice! ✨</p>;
}

function Report({ r, topic }) {
  const { analysis: a, metrics: m, words } = r;
  const pauseAt = new Map(m.pauses.map((p) => [p.after, p.sec]));
  const low = new Map(m.lowConf.map((w) => [w.index, w.confidence]));
  const good = m.wpm >= 120 && m.wpm <= 160;
  return (
    <section className="report">
      <div className="report-head">
        <div><p className="eyebrow">Your report</p><h2 className="serif">{topic}</h2></div>
        <button className="btn ghost" onClick={() => window.location.reload()}>Try another topic</button>
      </div>

      <div className="stats">
        <div className="stat big"><b>{a.score}</b><span>out of 100</span></div>
        <div className="stat"><b>{m.wpm}</b><span>words / min <i className={good ? 'good' : 'warn'}>{good ? 'good pace' : m.wpm < 120 ? 'a bit slow' : 'a bit fast'}</i></span></div>
        <div className="stat"><b>{m.wordCount}</b><span>words</span></div>
        <div className="stat"><b>{m.speakingSec}s</b><span>spoken</span></div>
        <div className="stat"><b>{m.fillers.total}</b><span>filler words</span></div>
      </div>

      <p className="summary serif">{a.summary}</p>

      <div className="grid">
        <div className="card"><h3>Grammar 📖</h3>
          <List items={a.grammar} render={(g) => (<><p><s>{g.original}</s> → <b>{g.correction}</b></p><small>{g.why}</small></>)} /></div>
        <div className="card"><h3>Pauses ⏸</h3>
          <List items={a.pauses} render={(p) => (<><p><span className={'tag ' + p.advice}>{p.advice}</span> after "{p.after}"</p><small>{p.reason}</small></>)} /></div>
        <div className="card"><h3>Make it stronger 💪</h3>
          <List items={a.focus} render={(f) => (<><p>"{f.sentence}"</p><small>{f.issue}<br />Try: {f.suggestion}</small></>)} /></div>
        <div className="card"><h3>Pronunciation 🗣</h3>
          <List items={a.pronunciation} render={(p) => (<><p><b>{p.word}</b></p><small>{p.tip}</small></>)} /></div>
        <div className="card"><h3>Loved this 💚</h3><ul>{a.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        <div className="card"><h3>Next time 🎯</h3><ul>{a.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
      </div>

      <div className="card">
        <h3>What we heard</h3>
        <p className="legend"><mark className="lc">unclear word</mark> <span className="fill">filler</span> <span className="chip">⏸ pause</span></p>
        <p className="transcript">
          {words.map((w, i) => (
            <span key={i}>
              {FILLERS.includes(w.clean) ? <span className="fill">{w.word}</span>
                : low.has(i) ? <mark className="lc" title={`${low.get(i)}% sure`}>{w.word}</mark> : w.word}{' '}
              {pauseAt.has(i) && <><em className="chip">⏸ {pauseAt.get(i)}s</em>{' '}</>}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}