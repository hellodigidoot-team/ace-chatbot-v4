// src/app/api/chat/route.js
import { NextResponse } from 'next/server';

/**
 * If you deploy on Vercel, define CHAT_API_URL in your environment variables.
 * Example: CHAT_API_URL="https://your-backend-api.com/query"
 */
const CHAT_API_URL =
  (process.env.CHAT_API_URL || '').replace(/^"|"$/g, '') ||
  'https://will-api-45901355656.us-south1.run.app/query';

export async function POST(req) {
  try {
    const { query, sessionId } = await req.json();

    // --- Validate inputs ---
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing "query" (string).' }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing "sessionId" (string).' }, { status: 400 });
    }

    // --- Forward to upstream chat API ---
    const upstreamResponse = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, sessionId }),
      // optional: add a timeout using AbortController if needed
    });

    const text = await upstreamResponse.text();

    // --- Handle non-2xx responses gracefully ---
    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: 'Upstream error',
          status: upstreamResponse.status,
          body: text,
        },
        { status: upstreamResponse.status }
      );
    }

    // --- Parse JSON safely ---
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON from upstream', body: text },
        { status: 502 }
      );
    }

    // --- Validate expected shape ---
    if (!data || typeof data.message !== 'string' || typeof data.response_id !== 'string') {
      return NextResponse.json(
        { error: 'Unexpected upstream response format', body: data },
        { status: 502 }
      );
    }

    // --- Return clean response to frontend ---
    return NextResponse.json({
      response_id: data.response_id,
      message: data.message,
    });
  } catch (err) {
    // Catch any unexpected runtime or network errors
    return NextResponse.json(
      {
        error: 'Internal error',
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
