// src/app/chat/page.tsx
'use client';

import { useState, useRef, useEffect, type FormEvent, type ComponentPropsWithoutRef, type ReactNode, type CSSProperties } from 'react';
import Image from 'next/image';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import styles from './chat.module.css';

// ⬇️ Markdown + GFM + code highlighting
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// ✅ Import the theme as a default export (fixes the style typing error)
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';

type Msg = { role: 'user' | 'assistant'; content: string; response_id?: string };

interface ChatResponse {
  response_id?: string;
  message?: string;
  error?: string;
  status?: number;
  body?: unknown;
}

/** ---- Minimal Bootstrap typings (no `any`) ---- */
type BSPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto' | string;

interface BSTooltipOptions {
  placement?: BSPlacement;
  trigger?: string; // e.g. 'manual'
  container?: string | Element | false;
  customClass?: string;
  fallbackPlacements?: BSPlacement[];
}

interface BSTooltip {
  show(): void;
  hide(): void;
  dispose(): void;
}

interface BootstrapNamespace {
  Tooltip: new (el: Element, options?: BSTooltipOptions) => BSTooltip;
}

/** Bootstrap (from CDN in layout.tsx) */
declare global {
  interface Window {
    bootstrap?: BootstrapNamespace;
  }
}

function genSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `sess_${crypto.randomUUID()}`;
  }
  return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

/** ---------- Typed Code renderer (no internal imports, no any) ---------- */
type CodeProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
  children?: ReactNode;
};

const CodeBlock = ({ inline, className, children, style: codeStyle, ...props }: CodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children ?? '').replace(/\n$/, '');

  if (!inline) {
    return (
      <SyntaxHighlighter
        language={match?.[1] || 'plaintext'}
        // oneDark can be typed in a way that unions CSSProperties with a map; cast to the
        // expected index-signature type to satisfy the SyntaxHighlighter props.
        style={oneDark as unknown as { [key: string]: CSSProperties }}
        wrapLongLines
        PreTag="div"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    );
  }

  return (
    <code className={className} style={codeStyle} {...props}>
      {children}
    </code>
  );
};

// Public Components map from react-markdown (no private paths)
const mdComponents: Components = {
  code: CodeBlock,
};

export default function ChatPage() {
  const sessionIdRef = useRef<string>(genSessionId());
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [showChat, setShowChat] = useState(false);

  const [submittingFeedback, setSubmittingFeedback] = useState<'up' | 'down' | null>(null);

  // For error messages only. Success uses Bootstrap tooltips.
  const [feedbackNote, setFeedbackNote] = useState<string>('');

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Refs for feedback buttons and tooltip instances
  const upBtnRef = useRef<HTMLButtonElement | null>(null);
  const downBtnRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRefs = useRef<{ up: BSTooltip | null; down: BSTooltip | null }>({ up: null, down: null });

  // Scroll to newest
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, showLoader]);

  // Loader delay
  useEffect(() => {
    let t: number | undefined;
    if (loading) t = window.setTimeout(() => setShowLoader(true), 300);
    else setShowLoader(false);
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [loading]);

  // Cleanup tooltips on unmount using a stable snapshot of the ref (fixes React warning)
  useEffect(() => {
    const snapshot = tooltipRefs.current;
    return () => {
      const { up, down } = snapshot;
      try {
        up?.dispose();
      } catch {}
      try {
        down?.dispose();
      } catch {}
    };
  }, []);

  function showTooltipFor(which: 'up' | 'down', message: string) {
    const el = which === 'up' ? upBtnRef.current : downBtnRef.current;
    if (!el || !window.bootstrap || !window.bootstrap.Tooltip) return;

    try {
      (el as HTMLElement).removeAttribute('title');
      (el as HTMLElement).setAttribute('data-bs-title', message);

      tooltipRefs.current[which]?.dispose();

      const tip = new window.bootstrap.Tooltip(el, {
        placement: 'top',
        trigger: 'manual',
        container: 'body',
        customClass: 'feedback-tooltip',
        fallbackPlacements: ['top'],
      });

      tooltipRefs.current[which] = tip;
      tip.show();

      window.setTimeout(() => {
        try {
          tip.hide();
          window.setTimeout(() => {
            try {
              tip.dispose();
            } catch {}
            if (tooltipRefs.current[which] === tip) {
              tooltipRefs.current[which] = null;
            }
          }, 200);
        } catch {}
      }, 2000);
    } catch {
      // silent no-op
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = value.trim();
    if (!query || loading) return;

    if (!showChat) setShowChat(true);
    setMessages((m) => [...m, { role: 'user', content: query }]);
    setValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          sessionId: sessionIdRef.current,
        }),
      });

      let data: ChatResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Bad JSON from /api/chat (status ${res.status})`);
      }

      if (!res.ok || data?.error) {
        const msg =
          `Error: ${data?.error || 'Request failed'}` +
          (data?.status ? ` (${data.status})` : '') +
          (data?.body
            ? ` — ${typeof data.body === 'string' ? data.body : JSON.stringify(data.body)}`
            : '');
        setMessages((m) => [...m, { role: 'assistant', content: msg }]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content: String(data.message ?? ''),
            response_id: data.response_id,
          },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `There was an error contacting the assistant. ${String(err)}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // latest assistant message (used for feedback)
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const lastResponseId = lastAssistant?.response_id || null;

  async function sendFeedback(rating: 'up' | 'down') {
    if (!lastResponseId || submittingFeedback) return;
    setSubmittingFeedback(rating);
    setFeedbackNote('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_id: lastResponseId,
          sessionId: sessionIdRef.current,
          rating: rating === 'up' ? 'thumbs_up' : 'thumbs_down',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        const detail = data?.body
          ? ` — ${typeof data.body === 'string' ? data.body : JSON.stringify(data.body)}`
          : '';
        throw new Error(`${data?.error || 'Feedback failed'} (${res.status})${detail}`);
      }

      const tooltipMessage = rating === 'up' ? 'Thanks for the feedback!' : 'Feedback recorded.';
      showTooltipFor(rating, tooltipMessage);
    } catch (err) {
      setFeedbackNote(`Could not send feedback: ${String(err)}`);
    } finally {
      setSubmittingFeedback(null);
    }
  }

  const inputPlaceholder =
    messages.length === 0 ? 'What can I support you with' : 'What else can I support you with?';

  return (
    <main className={styles.hero}>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <section className={styles.stage}>
          <div
            className={`${styles.card} ${showChat ? styles.cardVisible : styles.cardHidden}`}
            aria-hidden={!showChat}
            aria-live="polite"
          >
            <div className={styles.transcript}>
              {showChat && messages.length === 0 && !loading && (
                <p className={styles.placeholder}>This is for the question and response area.</p>
              )}

              {/* Scrollable message list */}
              <div className={styles.messages}>
                {messages.map((m, i) => {
                  const isBot = m.role === 'assistant';
                  const isLastAssistant = isBot && m.response_id === lastResponseId;

                  return isBot ? (
                    <div key={i} className={`${styles.row} ${styles.botRow}`}>
                      <Image
                        src="/ghost.png"
                        alt="Ace"
                        width={32}
                        height={32}
                        className={styles.msgAvatar}
                      />
                      <div className={`${styles.msg} ${styles.bot}`}>
                        {/* ⬇️ Render assistant message as Markdown */}
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                          {m.content}
                        </ReactMarkdown>

                        {/* ✅ Feedback buttons inside ONLY the last assistant bubble */}
                        {isLastAssistant && (
                          <div className={styles.feedback}>
                            <button
                              ref={upBtnRef}
                              type="button"
                              className={styles.iconBtn}
                              aria-label="Thumbs up"
                              onClick={() => sendFeedback('up')}
                              disabled={!!submittingFeedback}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                            >
                              <Image
                                src="/thumbs_up.png"
                                alt="Thumbs up"
                                width={100}
                                height={100}
                                className={styles.thumbImg}
                                priority={false}
                              />
                            </button>

                            <button
                              ref={downBtnRef}
                              type="button"
                              className={styles.iconBtn}
                              aria-label="Thumbs down"
                              onClick={() => sendFeedback('down')}
                              disabled={!!submittingFeedback}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                            >
                              <Image
                                src="/thumbs_down.png"
                                alt="Thumbs down"
                                width={100}
                                height={100}
                                className={styles.thumbImg}
                                priority={false}
                              />
                            </button>

                            {feedbackNote && <span className={styles.feedbackNote}>{feedbackNote}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className={`${styles.row} ${styles.userRow}`}>
                      <div className={`${styles.msg} ${styles.user}`}>
                        {/* (Optional) render user text as Markdown too: */}
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  );
                })}

                {showLoader && (
                  <div className={`${styles.row} ${styles.botRow}`} role="status" aria-live="polite">
                    <Image
                      src="/ghost.png"
                      alt="Ace"
                      width={32}
                      height={32}
                      className={styles.msgAvatar}
                    />
                    <div className={`${styles.msg} ${styles.bot} ${styles.botTyping}`}>
                      <div className={styles.dotSpinner} aria-hidden="true">
                        <span></span><span></span><span></span>
                      </div>
                      <span className={styles.typingText}>Ace is thinking…</span>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            </div>
          </div>

          <form
            className={`${styles.inputDock} ${showChat ? styles.dockBottom : styles.dockCenter}`}
            onSubmit={onSubmit}
          >
            {!showChat && (
              <Image
                src="/ghost_beside.png"
                alt="Ace mascot"
                width={100}
                height={100}
                className={`${styles.inputGhost} ${styles.ghostVisible}`}
                onClick={() => inputRef.current?.focus()}
                priority
              />
            )}

            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder={inputPlaceholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
              style={{ color: '#000' }}
            />
          </form>
        </section>
      </SignedIn>
    </main>
  );
}
