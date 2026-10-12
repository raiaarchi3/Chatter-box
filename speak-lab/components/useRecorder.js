'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useRecorder() {
  const [level, setLevel] = useState(0);
  const rec = useRef(null);
  const stream = useRef(null);
  const chunks = useRef([]);
  const raf = useRef(0);
  const ctx = useRef(null);
  const resolver = useRef(null);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    ctx.current?.close().catch(() => {});
    stream.current = null;
    ctx.current = null;
    setLevel(0);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    const s = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    stream.current = s;

    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((m) =>
      window.MediaRecorder?.isTypeSupported(m),
    );
    const r = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
    chunks.current = [];
    r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    r.onstop = () => {
      const blob = new Blob(chunks.current, { type: r.mimeType || 'audio/webm' });
      cleanup();
      resolver.current?.(blob);
    };
    r.start(1000);
    rec.current = r;

    // live mic level
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    ctx.current = ac;
    const an = ac.createAnalyser();
    an.fftSize = 512;
    ac.createMediaStreamSource(s).connect(an);
    const buf = new Uint8Array(an.fftSize);
    const tick = () => {
      an.getByteTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += ((v - 128) / 128) ** 2;
      setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4));
      raf.current = requestAnimationFrame(tick);
    };
    tick();
  }, [cleanup]);

  const stop = useCallback(
    () =>
      new Promise((resolve) => {
        if (!rec.current || rec.current.state === 'inactive') return resolve(null);
        resolver.current = resolve;
        rec.current.stop();
      }),
    [],
  );

  return { start, stop, level };
}
