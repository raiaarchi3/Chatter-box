import { NextResponse } from 'next/server';
import { transcribe, computeMetrics, analyse } from '../../../lib/analysis';

export const runtime = 'nodejs';
export const maxDuration = 90;

export async function POST(req) {
  try {
    const form = await req.formData();
    const audio = form.get('audio');
    const topic = String(form.get('topic') || 'Free speech');
    const language = String(form.get('language') || 'en-US');
    const targetSec = Number(form.get('targetSec') || 60);
    const recordedSec = Number(form.get('recordedSec') || 0);

    if (!audio || typeof audio === 'string') {
      return NextResponse.json({ error: 'No audio received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    const words = await transcribe(buffer, audio.type, language);
    if (words.length < 3) {
      return NextResponse.json(
        { error: "I couldn't hear any speech. Check your mic and try again." },
        { status: 422 },
      );
    }

    const metrics = computeMetrics(words, recordedSec);
    const analysis = await analyse({ words, metrics, topic, targetSec, language });
    return NextResponse.json({ words, metrics, analysis });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Something went wrong.' }, { status: 500 });
  }
}
