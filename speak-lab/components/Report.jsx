'use client';

function paceLabel(wpm) {
  if (wpm < 110) return { text: 'a bit slow', tone: 'warn' };
  if (wpm > 170) return { text: 'too fast', tone: 'warn' };
  return { text: 'good pace', tone: 'good' };
}

const FILLERS = new Set(['um', 'uh', 'uhm', 'umm', 'er', 'erm', 'ah', 'hmm', 'mm']);
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export default function Report({ result, topic, targetSec, onRetry }) {
  const { words, metrics, analysis: a } = result;
  const pace = paceLabel(metrics.wpm);
  const pauseAt = new Map(metrics.pauses.map((p) => [p.after, p.sec]));
  const lowIdx = new Set(
    words
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => w.confidence < 0.8 && w.clean.length >= 3 && !FILLERS.has(w.clean))
      .map(({ i }) => i),
  );

  return (
    <section className="report">
      <header className="report-head">
        <div>
          <p className="eyebrow">Your topic</p>
          <h2 className="serif">{topic}</h2>
        </div>
        <button className="btn ghost" onClick={onRetry}>↻ Practice again</button>
      </header>

      <div className="stats">
        <div className="stat big">
          <b>{a.score ?? '–'}</b>
          <span>overall</span>
        </div>
        <div className="stat">
          <b>{metrics.wpm}</b>
          <span>words / min · <i className={pace.tone}>{pace.text}</i></span>
        </div>
        <div className="stat">
          <b>{metrics.fillers.total}</b>
          <span>filler words</span>
        </div>
        <div className="stat">
          <b>{metrics.pauses.length}</b>
          <span>long pauses</span>
        </div>
        <div className="stat">
          <b>{fmt(metrics.speakingSec)}</b>
          <span>spoken · target {fmt(targetSec)}</span>
        </div>
      </div>

      {a.summary && <p className="summary serif">{a.summary}</p>}

      <div className="card">
        <h3>Your speech, marked up</h3>
        <p className="legend">
          <span className="chip">⏸ long pause</span> <mark className="lc">unclear word</mark>{' '}
          <span className="fill">filler</span>
        </p>
        <p className="transcript">
          {words.map((w, i) => (
            <span key={i}>
              {lowIdx.has(i) ? (
                <mark className="lc" title={`Recognised with ${Math.round(w.confidence * 100)}% confidence`}>{w.word}</mark>
              ) : FILLERS.has(w.clean) ? (
                <span className="fill">{w.word}</span>
              ) : (
                w.word
              )}{' '}
              {pauseAt.has(i) && <em className="chip">⏸ {pauseAt.get(i)}s</em>}
            </span>
          ))}
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Grammar</h3>
          {a.grammar?.length ? (
            a.grammar.map((g, i) => (
              <div className="item" key={i}>
                <p><s>{g.original}</s> → <b>{g.correction}</b></p>
                <small>{g.why}</small>
              </div>
            ))
          ) : (
            <p className="muted">No grammar mistakes found. Nice.</p>
          )}
        </div>

        <div className="card">
          <h3>Pronunciation</h3>
          {a.pronunciation?.length ? (
            a.pronunciation.map((p, i) => (
              <div className="item" key={i}>
                <p><b>{p.word}</b></p>
                <small>{p.tip}</small>
              </div>
            ))
          ) : (
            <p className="muted">Nothing stood out.</p>
          )}
          <p className="note">Based on how confidently the words were recognised, so treat it as a guide.</p>
        </div>

        <div className="card">
          <h3>Pauses &amp; breathing</h3>
          {a.pauses?.length ? (
            a.pauses.map((p, i) => (
              <div className="item" key={i}>
                <p>
                  <span className={`tag ${p.advice}`}>{p.advice === 'add' ? 'add a pause' : 'shorten'}</span>{' '}
                  after “…{p.after}”
                </p>
                <small>{p.reason}</small>
              </div>
            ))
          ) : (
            <p className="muted">Your pacing flowed well.</p>
          )}
        </div>

        <div className="card">
          <h3>Sentences to focus on</h3>
          {a.focus?.length ? (
            a.focus.map((f, i) => (
              <div className="item" key={i}>
                <p>“{f.sentence}”</p>
                <small><b>Issue:</b> {f.issue}</small>
                <small><b>Try:</b> {f.suggestion}</small>
              </div>
            ))
          ) : (
            <p className="muted">No weak spots flagged.</p>
          )}
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>What went well</h3>
          <ul>{a.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="card">
          <h3>Next attempt</h3>
          <ul>{a.nextSteps?.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
