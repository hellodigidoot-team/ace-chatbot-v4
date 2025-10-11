// src/app/api/feedback/route.js
import { NextResponse } from 'next/server';

function deriveFeedbackUrl() {
  const chat = (process.env.CHAT_API_URL || '').replace(/^"|"$/g, '');
  try {
    const u = new URL(chat);
    // swap /query -> /feedback
    u.pathname = u.pathname.replace(/\/query\/?$/, '/feedback');
    return u.toString();
  } catch {
    return '';
  }
}

const FEEDBACK_API_URL =
  (process.env.FEEDBACK_API_URL || '').replace(/^"|"$/g, '') || deriveFeedbackUrl();

export async function POST(req) {
  try {
    const { response_id, sessionId, rating, comment } = await req.json();

    // Validate payload per spec
    if (!response_id || typeof response_id !== 'string') {
      return NextResponse.json({ error: 'Missing "response_id" (string).' }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing "sessionId" (string).' }, { status: 400 });
    }
    if (!['thumbs_up', 'thumbs_down'].includes(String(rating))) {
      return NextResponse.json(
        { error: 'Invalid "rating" (use "thumbs_up" | "thumbs_down").' },
        { status: 400 }
      );
    }
    if (!FEEDBACK_API_URL) {
      return NextResponse.json({ error: 'Feedback URL not configured.' }, { status: 500 });
    }

    // Forward to upstream exactly as specified
    const upstream = await fetch(FEEDBACK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response_id, sessionId, rating, comment }),
    });

    const raw = await upstream.text();

    if (!upstream.ok) {
      // Surface upstream details for quick debugging in the UI
      return NextResponse.json(
        { error: 'Upstream feedback error', status: upstream.status, body: raw },
        { status: upstream.status }
      );
    }

    let data;
    try { data = JSON.parse(raw); } catch { data = { ok: true, body: raw }; }
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
