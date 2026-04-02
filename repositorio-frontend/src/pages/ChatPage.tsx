import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { postChat, type ChatSource } from '../api/chat';
import pages from './Pages.module.css';
import styles from './ChatPage.module.css';

type Msg = { role: 'user' | 'assistant'; content: string; sources?: ChatSource[] };

export function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setErr(null);
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await postChat(q);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: res.answer, sources: res.sources },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo obtener respuesta.';
      setErr(msg);
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'No pude completar la consulta. Revise la conexión o inténtelo más tarde.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessages([]);
    setErr(null);
    setInput('');
  }

  return (
    <div className={styles.wrap}>
      <h1 className={pages.pageTitle}>Asistente (RAG)</h1>
      <p className={styles.lead}>
        Pregunta sobre el contenido de los PDFs indexados en el repositorio. Las respuestas se basan solo en
        fragmentos extraídos de esos documentos; si no hay coincidencias, el sistema lo indicará.
      </p>

      <div className={styles.thread} aria-live="polite">
        {messages.length === 0 && !loading && (
          <p className={styles.lead} style={{ margin: 0 }}>
            Escriba una pregunta abajo para comenzar.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAssistant}`}
          >
            {m.content}
            {m.role === 'assistant' && m.sources && m.sources.length > 0 ? (
              <div className={styles.sources}>
                <strong>Fuentes (fragmentos)</strong>
                <ul>
                  {m.sources.map((s, j) => (
                    <li key={j}>
                      <Link to={`/tesis/${s.thesis_id}`}>Tesis #{s.thesis_id}</Link>
                      {' — '}
                      <span>{s.excerpt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
        {loading ? <p className={styles.loading}>Pensando…</p> : null}
        <div ref={bottomRef} />
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej. ¿Qué trabajos mencionan agricultura sostenible?"
          maxLength={500}
          rows={3}
          disabled={loading}
          aria-label="Pregunta"
        />
        <div className={styles.toolbar}>
          <button type="submit" className={pages.primary} disabled={loading || !input.trim()}>
            Enviar
          </button>
          <button type="button" className={styles.secondary} onClick={handleClear}>
            Limpiar chat
          </button>
        </div>
      </form>
      {err ? <p className={styles.error}>{err}</p> : null}
    </div>
  );
}
