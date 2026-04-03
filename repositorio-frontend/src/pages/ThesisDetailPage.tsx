import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchThesisById, fetchThesisPdfBlob } from '../api/thesis';
import type { ThesisDetail } from '../api/types';
import { useAuth } from '../context/AuthContext';
import styles from './Pages.module.css';

export function ThesisDetailPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const numId = id ? Number(id) : NaN;
  const [thesis, setThesis] = useState<ThesisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfErr, setPdfErr] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(numId) || !token) {
      if (!Number.isFinite(numId)) setErr('Identificador inválido.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchThesisById(token, numId);
        if (!cancelled) setThesis(data);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : 'No se pudo cargar el trabajo.');
          setThesis(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numId, token]);

  async function handleOpenPdf() {
    if (!token || !thesis) return;
    setPdfErr(null);
    setPdfLoading(true);
    try {
      const blob = await fetchThesisPdfBlob(token, thesis.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setPdfErr(e instanceof Error ? e.message : 'No se pudo abrir el PDF.');
    } finally {
      setPdfLoading(false);
    }
  }

  if (!Number.isFinite(numId)) {
    return (
      <p className={styles.error}>
        <Link to="/">Volver al catálogo</Link>
      </p>
    );
  }

  if (loading) return <p className={styles.muted}>Cargando…</p>;
  if (err || !thesis) {
    return (
      <div>
        <p className={styles.error}>{err ?? 'No encontrado.'}</p>
        <Link to="/">← Catálogo</Link>
      </div>
    );
  }

  return (
    <article>
      <Link to="/" className={styles.back}>
        ← Catálogo
      </Link>
      <h1 className={styles.pageTitle}>{thesis.title}</h1>
      <p className={styles.detailMeta}>
        <strong>Autor:</strong> {thesis.author}
        <br />
        <strong>Año:</strong> {thesis.year}
        {thesis.program?.name ? (
          <>
            <br />
            <strong>Programa:</strong> {thesis.program.name}
          </>
        ) : null}
        {thesis.type?.name ? (
          <>
            <br />
            <strong>Tipo:</strong> {thesis.type.name}
          </>
        ) : null}
        {thesis.research_line?.name ? (
          <>
            <br />
            <strong>Línea de investigación:</strong> {thesis.research_line.name}
          </>
        ) : null}
      </p>
      <section className={styles.section}>
        <h2>Resumen</h2>
        <p className={styles.bodyText}>{thesis.abstract}</p>
      </section>
      {thesis.keywords && thesis.keywords.length > 0 && (
        <section className={styles.section}>
          <h2>Palabras clave</h2>
          <p className={styles.keywordChips}>
            {thesis.keywords.map((k) => (
              <span key={k.id} className={styles.chip}>
                {k.name}
              </span>
            ))}
          </p>
        </section>
      )}
      <p>
        <button
          type="button"
          className={styles.pdfLink}
          onClick={() => void handleOpenPdf()}
          disabled={pdfLoading}
        >
          {pdfLoading ? 'Abriendo PDF…' : 'Ver / descargar PDF'}
        </button>
        {pdfErr ? <span className={styles.error}> {pdfErr}</span> : null}
      </p>
    </article>
  );
}
