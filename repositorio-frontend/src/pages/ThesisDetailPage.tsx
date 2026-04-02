import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchThesisById, thesisPdfUrl } from '../api/thesis';
import type { ThesisDetail } from '../api/types';
import styles from './Pages.module.css';

export function ThesisDetailPage() {
  const { id } = useParams();
  const numId = id ? Number(id) : NaN;
  const [thesis, setThesis] = useState<ThesisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(numId)) {
      setErr('Identificador inválido.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchThesisById(numId);
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
  }, [numId]);

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

  const pdfHref = thesisPdfUrl(thesis.id);

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
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className={styles.pdfLink}>
          Ver / descargar PDF
        </a>
      </p>
    </article>
  );
}
