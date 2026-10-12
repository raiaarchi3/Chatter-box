'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Dropdown from './Dropdown';
import SlotMachine, { useSlot } from './SlotMachine';
import Report from './Report';
import { useRecorder } from './useRecorder';
import {
  CATEGORIES, FRAMEWORKS, INTERVIEW, INTERVIEW_SETS, LANGS, LEVELS, TOPICS, VOCAB, pool,
} from '../lib/topics';

const TABS = [
  { id: 'random', label: 'Random Topics', title: ['Speak', 'Up'], defaultSec: 60,
    steps: ['Get random topic', 'Pick your time', 'Record & speak!'] },
  { id: 'interview', label: 'Interview Prep', title: ['Interview', 'Prep'], defaultSec: 120,
    steps: ['Get a question', 'Pick your time', 'Answer out loud'] },
  { id: 'vocab', label: 'Learn Vocab', title: ['Learn', 'Vocab'], defaultSec: 30,
    steps: ['Get random word', 'Pick your time', 'Use it in speech'] },
];
function Doodles() {
  return (
    <div className="doodles" aria-hidden="true">
      <svg className="d d-star" viewBox="0 0 40 40"><path d="M20 3l4.6 10.4L36 14.6l-8.6 7.6 2.6 11.2L20 27.6 10 33.4l2.6-11.2L4 14.6l11.4-1.2z" /></svg>
      <svg className="d d-squig" viewBox="0 0 120 20"><path d="M2 12q8-12 16 0t16 0 16 0 16 0 16 0 16 0 16 0" /></svg>
      <svg className="d d-spark" viewBox="0 0 40 40"><path d="M20 4v10M20 26v10M4 20h10M26 20h10M9 9l7 7M24 24l7 7M31 9l-7 7M16 24l-7 7" /></svg>
      <svg className="d d-dots" viewBox="0 0 80 20"><circle cx="6" cy="10" r="3" /><circle cx="26" cy="10" r="3" /><circle cx="46" cy="10" r="3" /><circle cx="66" cy="10" r="3" /></svg>
      <svg className="d d-flower" viewBox="0 0 50 50"><circle cx="25" cy="10" r="8" /><circle cx="40" cy="25" r="8" /><circle cx="25" cy="40" r="8" /><circle cx="10" cy="25" r="8" /><circle cx="25" cy="25" r="5" className="core" /></svg>
      <svg className="d d-swirl" viewBox="0 0 50 50"><path d="M25 25c0-4 5-4 5 0s-8 6-10 0 4-14 14-10 8 18-4 22-24-2-22-18" /></svg>
      <svg className="d d-arc" viewBox="0 0 70 30"><path d="M3 25C15 3 50 3 66 22M66 22l-9-1M66 22l-3-9" /></svg>
      <svg className="d d-bolt" viewBox="0 0 30 40"><path d="M18 2L5 22h9l-3 16 14-22h-9z" /></svg>
    </div>
  );
}

const DURATIONS = [30, 60, 120, 180, 300];
const label = (s) => (s < 60 ? `${s}s` : `${s / 60} min`);
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.ceil(s % 60))).padStart(2, '0')}`;

export default function SpeechStudio() {
  const [tab, setTab] = useState('random');
  const [lang, setLang] = useState('en-US');
  const [level, setLevel] = useState('random');
  const [cat, setCat] = useState('hot');
  const [iset, setIset] = useState('behavioral');
  const [duration, setDuration] = useState(60);
  const [phase, setPhase] = useState('idle'); // idle | recording | analyzing | done
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [topicUsed, setTopicUsed] = useState('');

  const meta = TABS.find((t) => t.id === tab);
  const { start, stop, level: mic } = useRecorder();
  const startedAt = useRef(0);
  const finishing = useRef(false);

  const items = useMemo(() => {
    if (tab === 'random') return pool(TOPICS[cat], level);
    if (tab === 'interview') return pool(INTERVIEW[iset], level);
    return pool(VOCAB, level);
  }, [tab, cat, iset, level]);

  const slot = useSlot(items);
  const topic = items[slot.index];

  const changeTab = (id) => {
    setTab(id);
    setDuration(TABS.find((t) => t.id === id).defaultSec);
    setError('');
  };

  async function begin() {
    setError('');
    try {
      await start();
    } catch {
      setError('Microphone access was blocked. Allow it in your browser and try again.');
      return;
    }
    setTopicUsed(topic);
    finishing.current = false;
    startedAt.current = Date.now();
    setRemaining(duration);
    setPhase('recording');
  }

  async function finish() {
    if (finishing.current) return;
    finishing.current = true;
    const recordedSec = (Date.now() - startedAt.current) / 1000;
    const blob = await stop();
    if (!blob || blob.size < 2000 || recordedSec < 3) {
      setError('That was too short to analyse. Try speaking for a bit longer.');
      return setPhase('idle');
    }
    setPhase('analyzing');
    try {
      const fd = new FormData();
      fd.append('audio', blob, 'speech.webm');
      fd.append('topic', topic);
      fd.append('language', lang);
      fd.append('targetSec', String(duration));
      fd.append('recordedSec', String(recordedSec));
      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');
      setResult(data);
      setPhase('done');
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  }

  useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => {
      const left = duration - (Date.now() - startedAt.current) / 1000;
      setRemaining(left);
      if (left <= 0) finish();
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, duration]);

  const customMin = DURATIONS.includes(duration) ? '' : String(duration / 60);

  return (
    <main className="page">
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === tab ? 'on' : ''} onClick={() => changeTab(t.id)} disabled={phase !== 'idle' && phase !== 'done'}>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="brand hand">tiny steps to a louder voice</div>

      {phase === 'done' && result && (
        <Report result={result} topic={topicUsed} targetSec={duration} onRetry={() => { setPhase('idle'); setResult(null); }} />
      )}

      {phase === 'recording' && (
        <section className="stage">
          <p className="eyebrow">Speak now</p>
          <h2 className="serif topic-big">{topicUsed}</h2>
          <div className="timer" style={{ '--lvl': mic }}>
            <span className="pulse" />
            <b>{mmss(remaining)}</b>
          </div>
          <div className="bar"><i style={{ width: `${Math.min(100, ((duration - remaining) / duration) * 100)}%` }} /></div>
          <button className="btn solid" onClick={finish}>■ Stop &amp; get analysis</button>
        </section>
      )}

      {phase === 'analyzing' && (
        <section className="stage">
          <div className="spinner" />
          <h2 className="serif">Listening back to your speech…</h2>
          <p className="muted">Transcribing, timing your pauses and checking grammar. About 10–20 seconds.</p>
        </section>
      )}

      {phase === 'idle' && (
        <section className="hero">
          <div className="left">
            <div className="title-wrap">
              <Doodles />
              <h1 className="hand title">
                <span>{meta.title[0]}</span>
                <span>{meta.title[1]}</span>
              </h1>
            </div>
            <ol className="hand steps">
              {meta.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            {tab === 'interview' && (
              <div className="frameworks">
                <p className="eyebrow">Frameworks</p>
                {FRAMEWORKS.map((f) => (
                  <details key={f.name}>
                    <summary className="hand">{f.name}</summary>
                    <p>{f.body}</p>
                  </details>
                ))}
              </div>
            )}
          </div>

          <div className="right">
            <div className="filters">
              {tab !== 'interview' && <Dropdown value={lang} options={LANGS} onChange={setLang} />}
              {tab === 'interview' && <Dropdown value={iset} options={INTERVIEW_SETS} onChange={setIset} />}
              <Dropdown value={level} options={LEVELS} onChange={setLevel} />
              {tab === 'random' && <Dropdown value={cat} options={CATEGORIES} onChange={setCat} />}
            </div>

            <SlotMachine items={items} index={slot.index} spinning={slot.spinning} onSpin={slot.spin} />

            <div className="durations">
              <span className="eyebrow">Speak for</span>
              {DURATIONS.map((d) => (
                <button key={d} className={`pill sm ${duration === d ? 'on' : ''}`} onClick={() => setDuration(d)}>{label(d)}</button>
              ))}
              <label className={`pill sm custom ${customMin ? 'on' : ''}`}>
                <input
                  type="number" min="0.5" max="15" step="0.5" placeholder="custom"
                  value={customMin}
                  onChange={(e) => {
                    const m = parseFloat(e.target.value);
                    if (m > 0) setDuration(Math.min(15, m) * 60);
                  }}
                />
                min
              </label>
            </div>

            <div className="actions">
              <button className="btn solid" onClick={slot.spin} disabled={slot.spinning}>Spin!</button>
              <button className="btn ghost" onClick={begin} disabled={slot.spinning}>Start Timer →</button>
            </div>
            {error && <p className="error">{error}</p>}
          </div>
        </section>
      )}
    </main>
  );
}
