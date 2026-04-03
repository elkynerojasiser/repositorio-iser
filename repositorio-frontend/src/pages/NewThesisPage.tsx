import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchKeywordCatalog,
  fetchResearchLines,
  fetchThesisTypes,
} from '../api/classification';
import { createAcademicProgram, fetchAcademicPrograms } from '../api/programs';
import { createThesisWithPdf } from '../api/thesisAdmin';
import type { AcademicProgramRef, ClassificationRef } from '../api/types';
import { useAuth } from '../context/AuthContext';
import styles from './Pages.module.css';

function isAdminRole(user: { role?: { name: string } } | null): boolean {
  return user?.role?.name === 'admin';
}

export function NewThesisPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const admin = isAdminRole(user);

  const [programs, setPrograms] = useState<AcademicProgramRef[]>([]);
  const [thesisTypes, setThesisTypes] = useState<ClassificationRef[]>([]);
  const [researchLines, setResearchLines] = useState<ClassificationRef[]>([]);
  const [keywordCatalog, setKeywordCatalog] = useState<ClassificationRef[]>([]);

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingProgram, setSubmittingProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [abstract, setAbstract] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [programId, setProgramId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [researchLineId, setResearchLineId] = useState('');
  const [keywordIds, setKeywordIds] = useState<number[]>([]);
  const [pdf, setPdf] = useState<File | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoadingCatalog(true);
      setCatalogError(null);
      try {
        const [progs, types, lines, kws] = await Promise.all([
          fetchAcademicPrograms(token),
          fetchThesisTypes(token),
          fetchResearchLines(token),
          fetchKeywordCatalog(token),
        ]);
        if (cancelled) return;
        setPrograms(progs);
        setThesisTypes(types);
        setResearchLines(lines);
        setKeywordCatalog(kws);
        if (progs.length > 0) {
          setProgramId((prev) => prev || String(progs[0].id));
        }
        if (types.length > 0) {
          setTypeId((prev) => prev || String(types[0].id));
        }
        if (lines.length > 0) {
          setResearchLineId((prev) => prev || String(lines[0].id));
        }
      } catch (e) {
        if (!cancelled) {
          setCatalogError(
            e instanceof Error ? e.message : 'No se pudo cargar el catálogo de clasificación.'
          );
        }
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!pdf) {
      setError('Debes seleccionar un archivo PDF.');
      return;
    }
    const y = Number(year);
    const pid = Number(programId);
    const tid = Number(typeId);
    const rid = Number(researchLineId);
    if (!Number.isFinite(y) || !Number.isFinite(pid) || !Number.isFinite(tid) || !Number.isFinite(rid)) {
      setError('Año, programa, tipo o línea no válidos.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createThesisWithPdf(token, {
        title: title.trim(),
        author: author.trim(),
        abstract: abstract.trim(),
        year: y,
        programId: pid,
        typeId: tid,
        researchLineId: rid,
        keywordIds,
        pdf,
      });
      navigate('/admin/tesis', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el trabajo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateProgram(e: FormEvent) {
    e.preventDefault();
    if (!token || !admin) return;
    const name = newProgramName.trim();
    if (!name) {
      setError('Escribe el nombre del programa.');
      return;
    }
    setSubmittingProgram(true);
    setError(null);
    try {
      const created = await createAcademicProgram(token, name);
      setPrograms((prev) => [...prev, created]);
      setProgramId(String(created.id));
      setNewProgramName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el programa.');
    } finally {
      setSubmittingProgram(false);
    }
  }

  const canShowForm =
    !loadingCatalog &&
    !catalogError &&
    programs.length > 0 &&
    thesisTypes.length > 0 &&
    researchLines.length > 0;

  return (
    <div>
      <div className={styles.backRow}>
        <Link to="/admin/tesis" className={styles.back}>
          ← Panel: trabajos de grado
        </Link>
        <Link to="/" className={styles.backMuted}>
          Catálogo público
        </Link>
      </div>
      <h1 className={styles.pageTitle}>Cargar trabajo de grado</h1>
      <p className={styles.lead}>
        Completa los datos, elige tipo, línea de investigación y palabras clave (catálogo gestionado
        por administración). Adjunta el PDF.
      </p>

      {loadingCatalog && <p className={styles.muted}>Cargando catálogos…</p>}
      {catalogError && <p className={styles.error}>{catalogError}</p>}

      {!loadingCatalog && !catalogError && programs.length === 0 && (
        <p className={styles.error}>
          No hay programas académicos.
          {admin
            ? ' Crea el primero abajo.'
            : ' Pide a un administrador que cree programas en el sistema.'}
        </p>
      )}

      {!loadingCatalog && !catalogError && programs.length > 0 && thesisTypes.length === 0 && (
        <p className={styles.error}>
          No hay tipos de trabajo definidos. Un administrador debe crearlos en la API (
          <code className={styles.codeInline}>/api/thesis-types</code>).
        </p>
      )}

      {!loadingCatalog && !catalogError && programs.length > 0 && researchLines.length === 0 && (
        <p className={styles.error}>
          No hay líneas de investigación. Un administrador debe crearlas (
          <code className={styles.codeInline}>/api/research-lines</code>).
        </p>
      )}

      {!loadingCatalog && !catalogError && programs.length === 0 && admin && (
        <div className={styles.inlineCard}>
          <p className={styles.muted}>Crea el primer programa académico.</p>
          <form className={styles.staffForm} onSubmit={handleCreateProgram}>
            <label className={styles.field}>
              <span>Nombre del programa</span>
              <input
                required
                placeholder="ej. Ingeniería de Sistemas"
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.primary} disabled={submittingProgram}>
              {submittingProgram ? 'Creando…' : 'Crear programa'}
            </button>
          </form>
        </div>
      )}

      {canShowForm && (
        <form className={styles.staffForm} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Título</span>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Autor</span>
            <input required value={author} onChange={(e) => setAuthor(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Programa académico</span>
            <select
              required
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Tipo de trabajo</span>
            <select required value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              {thesisTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Línea de investigación</span>
            <select
              required
              value={researchLineId}
              onChange={(e) => setResearchLineId(e.target.value)}
            >
              {researchLines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Palabras clave</span>
            <select
              multiple
              className={styles.selectMultiple}
              value={keywordIds.map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                setKeywordIds(selected);
              }}
            >
              {keywordCatalog.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            <span className={styles.fieldHint}>
              Mantén Ctrl (Cmd en Mac) para elegir varias. Opcional si el catálogo está vacío.
            </span>
          </label>
          <label className={styles.field}>
            <span>Año</span>
            <input
              type="number"
              required
              min={1900}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Resumen (abstract)</span>
            <textarea
              required
              rows={5}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Archivo PDF</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              required
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.primary} disabled={submitting}>
            {submitting ? 'Guardando…' : 'Publicar trabajo'}
          </button>
        </form>
      )}
    </div>
  );
}
