// src/app/api/chat/route.js
import { NextResponse } from 'next/server';

const CHAT_API_URL = (process.env.CHAT_API_URL || '').replace(/^"|"$/g, '');

export async function POST(req) {
  try {
    const { query, sessionId } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing "query" (string).' }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing "sessionId" (string).' }, { status: 400 });
    }

    const upstream = await fetch(
      CHAT_API_URL || 'https://will-api-45901355656.us-south1.run.app/query',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sessionId }),
      }
    );

    const raw = await upstream.text();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream error', status: upstream.status, body: raw },
        { status: upstream.status }
      );
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON from upstream', body: raw },
        { status: 502 }
      );
    }

    // Expecting: { response_id, message }
    if (!data || typeof data.message !== 'string' || !data.response_id) {
      return NextResponse.json(
        { error: 'Unexpected upstream shape', body: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      response_id: data.response_id,
      message: data.message,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
